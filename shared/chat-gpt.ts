import {
    ChatCompletionRequestMessage,
    CreateCompletionResponseUsage,
    OpenAIApi
} from 'openai'

import { HistoryMode } from './options'
import { Result } from './result'
import { DatabaseConnection } from './connectors/utils'
import { Instrospection } from './types'

export type GptSqlResponse = {
    query: string
    sqlQuery?: string
    result?: Result
    error?: string
    usage?: CreateCompletionResponseUsage
}

type MessageOptions = {
    query: string
    history?: GptSqlResponse[]
    historyMode: HistoryMode
    dbConnection: DatabaseConnection
    introspection?: Instrospection
}

const createMessages = async ({
    query,
    history,
    historyMode,
    introspection,
    dbConnection
}: MessageOptions): Promise<ChatCompletionRequestMessage[]> => {
    // * Get the SQL introspection
    const schema = JSON.stringify(
        introspection ? introspection : await dbConnection.getIntrospection(),
        null,
        0
    )

    const messages: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content: `You are a database developer that only responds in ${dbConnection.dialectName} without formatting`
        },
        {
            role: 'system',
            content: 'uuids should be generated with gen_random_uuid()'
        },
        {
            role: 'system',
            content: 'queries on strings should be case insensitive'
        },
        {
            role: 'system',
            content: `database: ${schema}`
        }
    ]

    // * Add all previous queries
    history
        ?.filter(entry => !!entry.sqlQuery)
        .forEach(entry => {
            messages.push({ role: 'user', content: entry.query })
            messages.push({ role: 'assistant', content: entry.sqlQuery! })
            if (historyMode === 'all' && entry.result) {
                messages.push({
                    role: 'system',
                    content: `the result of the query is: ${JSON.stringify(
                        entry.result
                    )}`
                })
            }
            if (entry.error) {
                messages.push({
                    role: 'system',
                    content: `the query failed with error: ${entry.error}`
                })
            }
        })

    // * Add the query
    messages.push({
        role: 'user',
        content: query
    })
    return messages
}

export const getSqlQuery = async ({
    openai,
    model,
    ...options
}: MessageOptions & {
    openai: OpenAIApi
    model: string
}): Promise<{ sqlQuery: string; usage?: CreateCompletionResponseUsage }> => {
    // * Query OpenAI
    const completion = await openai.createChatCompletion({
        model,
        messages: await createMessages(options),
        temperature: 0
    })
    const sqlQuery = completion.data.choices[0].message?.content
    if (!sqlQuery) {
        throw new Error('empty response')
    }
    return { sqlQuery, usage: completion.data.usage }
}
