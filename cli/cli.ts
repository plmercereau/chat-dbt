import { Configuration, OpenAIApi } from 'openai'
import { CLIOptions } from '.'
import prompts from 'prompts'
import { GptSqlResult, executeQuery } from '@/utils/chat-gpt'
import chalk from 'chalk'

export const startCLI = async (options: CLIOptions) => {
    const { apiKey, organization } = options
    const openai = new OpenAIApi(new Configuration({ apiKey, organization }))
    const history: GptSqlResult[] = []
    while (true) {
        const { query } = await prompts(
            {
                type: 'text',
                name: 'query',
                message: 'Describe your query'
            },
            { onCancel: () => process.exit() }
        )
        await executeQueryAndShowResult({
            openai,
            query,
            history,
            ...options
        })
    }
}

const executeQueryAndShowResult = async ({
    query,
    history,
    ...rest
}: CLIOptions & {
    query: string
    openai: OpenAIApi
    history: GptSqlResult[]
}) => {
    const { openai, database, format } = rest
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
        const { retry } = await prompts(
            {
                type: 'confirm',
                name: 'retry',
                message: 'Retry?',
                initial: true
            },
            { onCancel: () => process.exit() }
        )
        if (retry) {
            let newQuery = query
            if (sqlQuery) {
                history.push(execution)
                newQuery = `The query failed with the error: ${error}. Try again.`
            }
            await executeQueryAndShowResult({
                query: newQuery,
                history,
                ...rest
            })
        }
        return
    }

    history.push(execution)
    switch (format) {
        case 'table':
            if (result?.columns?.length) {
                console.table(result)
            } else if (!error) {
                console.log('Success')
            }
            break
        case 'json':
            console.log(JSON.stringify(result))
            break
    }
}
