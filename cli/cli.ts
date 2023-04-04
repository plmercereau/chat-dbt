import chalk from 'chalk'
import { Configuration, OpenAIApi } from 'openai'
import ora from 'ora'
import prompts from 'prompts'

import { GptSqlResponse, getSqlQuery, runSqlQuery } from '@/shared/chat-gpt'
import { getIntrospection } from '@/shared/introspection'

import { CommonOptions } from './index'

export const startCLI = async (options: CommonOptions) => {
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
}: CommonOptions & {
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    openai: OpenAIApi
    history?: GptSqlResponse[]
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
            history,
            openai,
            model,
            introspection
        })
        if (options.confirm) {
            // * Ask the user's confirmation before executing the SQL query
            spinner.stop()
            console.log(chalk.greenBright(sqlQuery))
            const { confirm } = await prompts({
                type: 'confirm',
                name: 'confirm',
                message: 'Execute the query?',
                initial: true
            })
            if (!confirm) {
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
            history.push({ query, sqlQuery, result })
        } else {
            history.length = 0
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
                        console.table(item.rows)
                    } else {
                        // * No data is expected e.g. INSERT statement with no RETURNING clause
                        console.table([{ count: item.count }])
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
    }
}
