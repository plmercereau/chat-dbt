import chalk from 'chalk'
import { Configuration, OpenAIApi } from 'openai'
import ora from 'ora'
import prompts from 'prompts'

import { GptSqlResult, getSqlQuery, runSqlQuery } from '@/shared/chat-gpt'
import { getIntrospection } from '@/shared/introspection'

import { CLIOptions } from './index'

export const startCLI = async (options: CLIOptions) => {
    const { apiKey, organization } = options
    const openai = new OpenAIApi(new Configuration({ apiKey, organization }))
    while (true) {
        const { query } = await prompts(
            {
                type: 'text',
                name: 'query',
                message: 'Describe your query',
                validate: value => !!value || 'Query cannot be empty'
            },
            { onCancel: () => process.exit() }
        )
        await executeQueryAndShowResult({
            openai,
            query,
            ...options
        })
    }
}

const executeQueryAndShowResult = async ({
    query,
    history = [],
    ...options
}: CLIOptions & {
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    openai: OpenAIApi
    history?: GptSqlResult[]
}) => {
    const { openai, database, format, keepContext } = options
    const spinner = ora()
    spinner.start()
    let sqlQuery: string = ''
    try {
        spinner.text = 'Getting SQL introspection...'
        const introspection = await getIntrospection(database)
        spinner.text = 'Calling OpenAI...'
        sqlQuery = await getSqlQuery({ query, history, openai, introspection })
        spinner.text = 'Running query...'
        const result = await runSqlQuery({ sqlQuery, database })
        spinner.succeed('Success')
        console.log(chalk.dim(sqlQuery))

        if (keepContext) {
            history.push({ query, sqlQuery, result })
        } else {
            history.length = 0
        }
        switch (format) {
            case 'table':
                if (result.length) {
                    if (result.columns) {
                        // * Single table
                        console.table(result)
                    } else {
                        // * Multiple tables e.g. more thant one SELECT statement
                        result.forEach(table => console.table(table))
                    }
                }
                break
            case 'json':
                console.log(JSON.stringify(result))
                break
        }
    } catch (e) {
        const error = e as Error
        spinner.fail(error.message)
        let retry = false
        if (options.retries > 0) {
            retry = true
            options.retries--
        } else {
            const prompt = await prompts(
                {
                    type: 'confirm',
                    name: 'retry',
                    message: 'Retry?',
                    initial: options.retries === undefined ? true : false
                },
                { onCancel: () => process.exit() }
            )
            retry = prompt.retry
        }
        if (retry) {
            if (sqlQuery !== '') {
                history.push({
                    query,
                    sqlQuery,
                    result: undefined,
                    error: error.message
                })
                query = `The query failed with the error: ${error}. Try again.`
            }
            console.log(
                chalk.blue('!'),
                'Retrying with query:',
                chalk.bold(query)
            )
            await executeQueryAndShowResult({
                query,
                history,
                ...options
            })
        }
        return
    } finally {
        // spinner.stop()
    }
}
