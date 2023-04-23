import chalk from 'chalk'
import inquirer from 'inquirer'
import { Configuration, OpenAIApi } from 'openai'
import ora from 'ora'
import table from 'tty-table'

import { GptSqlResponse, getSqlQuery, runSqlQuery } from '@/shared/chat-gpt'
import { getErrorPrompt } from '@/shared/error'
import { getIntrospection } from '@/shared/introspection'

import InputHistoryPrompt from './input-history'
import { CommonOptions } from './index'
import { editFile } from './utils'

inquirer.registerPrompt('input-history', InputHistoryPrompt)

export const startCLI = async (options: CommonOptions) => {
    const { key, org } = options
    const openai = new OpenAIApi(
        new Configuration({ apiKey: key, organization: org })
    )
    const history: string[] = []

    while (true) {
        const { query } = await inquirer.prompt([
            {
                type: 'input-history',
                name: 'query',
                message: 'Describe your query',
                validate: value => !!value || 'Query cannot be empty',
                history
            }
        ])
        history.push(query)
        await executeQueryAndShowResult({
            openai,
            query,
            ...options
        })
    }
}

const executeQueryAndShowResult = async ({
    query,
    context = [],
    ...options
}: CommonOptions & {
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    openai: OpenAIApi
    context?: GptSqlResponse[]
}) => {
    const { openai, database, format, keepContext, model } = options
    const spinner = ora()
    spinner.start()
    let sqlQuery: string = ''
    try {
        spinner.text = 'Getting SQL introspection...'
        const introspection = await getIntrospection(database)
        spinner.text = 'Calling OpenAI...'
        sqlQuery = await getSqlQuery({
            query,
            context,
            openai,
            model,
            introspection
        })
        if (options.confirm) {
            // * Ask the user's confirmation before executing the SQL query
            spinner.stop()
            // * Confirm the SQL query, with the possibility to edit it
            const confirmPrompt = async (): Promise<void> => {
                console.log(chalk.greenBright(sqlQuery))
                const { confirm } = await inquirer.prompt([
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
        spinner.text = 'Running query...'
        const result = await runSqlQuery({ sqlQuery, database })
        spinner.succeed('Success')
        if (!options.confirm) {
            // * Print the SQL query, but only if it's not already printed
            console.log(chalk.dim(sqlQuery))
        }

        if (keepContext) {
            context.push({ query, sqlQuery, result })
        } else {
            context.length = 0
        }
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
                        console.log(t.render())
                    } else {
                        // * No data is expected e.g. INSERT statement with no RETURNING clause
                        const t = table(
                            [{ value: 'count' }],
                            [{ count: item.count }]
                        )
                        console.log(t.render())
                    }
                })
                break
            case 'json':
                console.log(
                    JSON.stringify(
                        result.map(({ count, rows, columns }) =>
                            columns ? rows : count === null ? true : count
                        ),
                        null,
                        2
                    )
                )
                break
        }
    } catch (e) {
        const error = e as Error
        spinner.fail(error.message)
        let retry = false
        if (options.askCorrections > 0) {
            retry = true
            options.askCorrections--
        } else {
            const prompt = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'retry',
                    message: 'Ask correction?',
                    default: options.askCorrections === undefined ? true : false
                }
            ])
            retry = prompt.retry
        }
        if (retry) {
            if (sqlQuery !== '') {
                context.push({
                    query,
                    sqlQuery,
                    result: undefined,
                    error: error.message
                })
                query = getErrorPrompt(error.message)
            }
            console.log(chalk.blue('!'), 'Retrying with:', chalk.bold(query))
            await executeQueryAndShowResult({
                query,
                context,
                ...options
            })
        }
    }
}
