import { Configuration, OpenAIApi } from 'openai'
import { CLIOptions } from '.'
import prompts from 'prompts'
import { GptSqlResult, executeQuery } from '@/utils/chat-gpt'
import chalk from 'chalk'

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
    query: string
    openai: OpenAIApi
    history?: GptSqlResult[]
}) => {
    const { openai, database, format, keepContext } = options
    const execution = await executeQuery({
        openai,
        query,
        database,
        history
    })
    const { sqlQuery, result, error } = execution
    if (sqlQuery) {
        console.log(chalk.dim(sqlQuery))
    }
    if (error) {
        console.error(chalk.red(error))
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
                    initial: true
                },
                { onCancel: () => process.exit() }
            )
            retry = prompt.retry
        }
        if (retry) {
            if (sqlQuery) {
                history.push(execution)
                query = `The query failed with the error: ${error}. Try again.`
            }
            console.log('Retrying with query:', query)
            await executeQueryAndShowResult({
                query,
                history,
                ...options
            })
        }
        return
    }
    if (keepContext) {
        history.push(execution)
    } else {
        history.length = 0
    }
    switch (format) {
        case 'table':
            if (result?.columns?.length) {
                console.table(result)
            } else if (!error) {
                console.log(chalk.green('✔'), 'Success')
            }
            break
        case 'json':
            console.log(JSON.stringify(result))
            break
    }
}
