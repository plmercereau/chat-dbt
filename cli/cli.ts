import { Configuration, OpenAIApi } from 'openai'
import { CLIOptions } from '.'
import prompts from 'prompts'
import { GptSqlResult, executeQuery } from '@/utils/chat-gpt'
import chalk from 'chalk'

export const startCLI = async ({
    database,
    apiKey,
    organization,
    format
}: CLIOptions) => {
    const openai = new OpenAIApi(
        new Configuration({
            apiKey,
            organization
        })
    )
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
        const execution = await executeQuery({
            openai,
            query,
            database,
            history
        })
        history.push(execution)
        const { query: sqlQuery, result, error } = execution
        if (sqlQuery) {
            console.log(chalk.dim(sqlQuery))
        }
        if (error) {
            console.error(chalk.red(error))
        }

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
}
