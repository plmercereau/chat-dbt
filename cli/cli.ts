import chalk from 'chalk'
import { stringify } from 'csv-stringify/sync'
import inquirer from 'inquirer'
import { OpenAIApi } from 'openai'
import ora from 'ora'
import readline from 'readline'
import table from 'tty-table'

import {
    GptSqlResponse,
    GptSqlResultItem,
    getSqlQuery,
    runSqlQuery
} from '@/shared/chat-gpt'
import { ERROR_PROMPT } from '@/shared/error'
import { getIntrospection } from '@/shared/introspection'
import { initOpenAI } from '@/shared/openai'
import { ResultFormat, OutputStream } from '@/shared/options'

import { CommonOptions } from './index'
import InputHistoryPrompt from './input-history'
import { editFile } from './utils'

type YesNo = 'yes' | 'no'

inquirer.registerPrompt('input-history', InputHistoryPrompt)

export const startCLI = async (options: CommonOptions) => {
    const openai = initOpenAI(options.key, options.org)
    const history: GptSqlResponse[] = []

    if (process.stdin.isTTY) {
        // * Interactive mode
        // * The history of queries is not calculated from the full his
        // * as the history may not be saved between queries when using
        // * the option --history=queries or --history=none
        const promptHistory: string[] = []
        while (true) {
            const { query } = await inquirer.prompt([
                {
                    type: 'input-history',
                    name: 'query',
                    message: 'Describe your query',
                    validate: value => !!value || 'Query cannot be empty',
                    history: promptHistory
                }
            ])
            promptHistory.push(query)
            await executeQueryAndShowResult({
                openai,
                query,
                history,
                ...options
            })
        }
    } else {
        // * Pipe mode
        const rl = readline.createInterface({
            input: process.stdin,
            terminal: false
        })
        for await (const query of rl) {
            await executeQueryAndShowResult({
                openai,
                query,
                history,
                ...options
            })
        }
    }
}

const printResult = async (
    result: GptSqlResultItem[],
    format: ResultFormat,
    output: OutputStream
) => {
    switch (format) {
        case 'table':
            result.forEach(item => {
                if (item.count === null) {
                    // * Success, no data
                    return
                }
                if (item.columns) {
                    // * Data is expected e.g. SELECT statement
                    const t = table(
                        item.columns.map(col => ({ value: col.name })),
                        item.rows,
                        { defaultValue: '' }
                    )
                    println(t.render(), output)
                } else {
                    // * No data is expected e.g. INSERT statement with no RETURNING clause
                    const t = table(
                        [{ value: 'count' }],
                        [{ count: item.count }]
                    )
                    println(t.render(), output)
                }
            })
            break
        case 'json':
            println(
                JSON.stringify(
                    result.map(({ count, rows, columns }) =>
                        columns ? rows : count === null ? true : count
                    ),
                    null,
                    2
                ),
                output
            )
            break
        case 'csv':
            result.forEach(({ count, rows, columns }) => {
                println(
                    stringify(
                        columns
                            ? rows
                            : count === null
                            ? [{ success: true }]
                            : [{ count }],
                        { header: true }
                    ),
                    output
                )
            })
            break
    }
}
const println = (message: string, output: OutputStream) => {
    if (output === 'none') {
        return
    }
    output === 'stdout' ? console.log(message) : console.error(message)
}

export const executeQueryAndShowResult = async ({
    query,
    history = [],
    ...options
}: CommonOptions & {
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    openai: OpenAIApi
    history?: GptSqlResponse[]
    stdin?: boolean
}) => {
    const tty = process.stdin.isTTY
    const spinner = ora({ isSilent: !tty })
    spinner.start()
    let sqlQuery: string = ''
    try {
        if (!sqlQuery) {
            spinner.text = 'Getting SQL introspection...'
            const introspection = await getIntrospection(options.database)
            spinner.text = 'Calling OpenAI... '
            const result = await getSqlQuery({
                query,
                history,
                historyMode: options.historyMode,
                openai: options.openai,
                model: options.model,
                introspection
            })
            sqlQuery = result.sqlQuery
            println(
                `${result.usage?.total_tokens} tokens used`,
                options.outputInfo
            )
            if (options.confirm && tty) {
                // * Ask the user's confirmation before executing the SQL query
                spinner.stop()
                // * Confirm the SQL query, with the possibility to edit it
                const confirmPrompt = async (): Promise<void> => {
                    println(chalk.greenBright(sqlQuery), options.outputSql)
                    const { confirm } = await inquirer.prompt<{
                        confirm: YesNo | 'edit'
                    }>([
                        {
                            type: 'list',
                            name: 'confirm',
                            message: 'Execute the query?',
                            choices: [
                                { key: 'y', name: 'Yes', value: 'yes' },
                                { key: 'n', name: 'No', value: 'no' },
                                { key: 'e', name: 'Edit', value: 'edit' }
                            ],
                            default: 'yes'
                        }
                    ])
                    if (confirm === 'no') {
                        throw new Error('User cancelled')
                    }
                    if (confirm === 'edit') {
                        sqlQuery = await editFile({
                            contents: sqlQuery,
                            postfix: '.sql'
                        })
                        // * Ask the user's confirmation again
                        return confirmPrompt()
                    }
                }
                try {
                    await confirmPrompt()
                } catch {
                    // * User did not confirm the query
                    return
                }
                spinner.start()
            }
        }
        spinner.text = 'Running query...'
        const result = await runSqlQuery({
            sqlQuery,
            database: options.database
        })
        spinner.stop()
        if (!options.confirm) {
            // * Print the SQL query, but only if it's not already printed
            println(chalk.dim(sqlQuery), options.outputSql)
        }
        spinner.succeed('Success')
        if (options.historyMode === 'none') {
            history.length = 0
        } else {
            history.push({ query, sqlQuery, result })
        }
        printResult(result, options.format, options.outputResult)
    } catch (e) {
        const error = e as Error
        spinner.stop()
        if (sqlQuery) {
            println(chalk.dim(sqlQuery), options.outputSql)
        }
        if (tty) {
            spinner.fail(error.message)
        } else {
            println(error.message, options.outputInfo)
        }

        type Retry = 'yes' | 'no' | 'editPrompt' | 'editSql'
        let retry: Retry = 'no'
        if (options.autoCorrect > 0) {
            retry = 'yes'
            options.autoCorrect--
        } else if (tty) {
            const choices = [
                { key: 'y', name: 'Yes', value: 'yes' },
                { key: 'n', name: 'No', value: 'no' },
                { key: 'e', name: 'Edit prompt', value: 'editPrompt' }
            ]
            if (sqlQuery) {
                choices.push({
                    key: 'q',
                    name: 'Edit SQL',
                    value: 'editSql'
                })
            }
            const prompt = await inquirer.prompt<{ retry: Retry }>([
                {
                    type: 'list',
                    name: 'retry',
                    message: 'Ask correction?',
                    choices,
                    default: 'yes'
                }
            ])
            retry = prompt.retry
        }
        if (
            (retry !== 'no' && sqlQuery !== '') ||
            options.historyMode !== 'none'
        ) {
            history.push({
                query,
                sqlQuery,
                result: undefined,
                error: error.message
            })
        }
        if (retry !== 'no') {
            query = ERROR_PROMPT
            if (retry === 'editPrompt') {
                query = await editFile({ contents: query })
            }
            if (retry === 'editSql') {
                sqlQuery = await editFile({
                    contents: sqlQuery,
                    postfix: '.sql'
                })
                try {
                    spinner.start()
                    const result = await runSqlQuery({
                        sqlQuery,
                        database: options.database
                    })
                    spinner.stop()
                    println(chalk.dim(sqlQuery), options.outputSql)
                    spinner.succeed('Success')
                    printResult(result, options.format, options.outputResult)
                } finally {
                    return
                }
            }
            println(
                `${chalk.blue('!')} Retrying with: ${chalk.bold(query)}`,
                options.outputInfo
            )
            await executeQueryAndShowResult({
                query,
                history,
                ...options
            })
        }
    }
}
