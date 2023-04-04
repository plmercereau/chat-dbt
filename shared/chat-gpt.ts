import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import { Row, RowList } from 'postgres'

import { Instrospection, getIntrospection } from './introspection'
import { getSqlConnection } from './sql-connection'

export type GptSqlResult = {
    query: string
    sqlQuery?: string
    result?: RowList<(Row & Iterable<Row>)[]>
    error?: string
}

export type MessageOptions = { query: string; history?: GptSqlResult[] } & (
    | {
          database: string
      }
    | {
          introspection: Instrospection
      }
)

export const createMessages = async ({
    query,
    history,
    ...variant
}: MessageOptions): Promise<ChatCompletionRequestMessage[]> => {
    // * Get the SQL introspection
    const schema = JSON.stringify(
        'introspection' in variant
            ? variant.introspection
            : await getIntrospection(variant.database),

        null,
        0
    )

    const messages: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content:
                'You are a postgresql developer that only responds in sql without formatting'
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
    history?.forEach(entry => {
        messages.push({ role: 'user', content: entry.query })
        messages.push({ role: 'assistant', content: entry.sqlQuery! })
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
}): Promise<string> => {
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
    return sqlQuery
}

export const runSqlQuery = async (options: {
    sqlQuery: string
    database: string
}): Promise<RowList<(Row & Iterable<Row>)[]>> => {
    const { sqlQuery, database } = options
    return getSqlConnection(database).unsafe(sqlQuery)
}

export const runQuery = async (options: {
    openai: OpenAIApi
    model: string
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    database: string
    history?: GptSqlResult[]
}): Promise<GptSqlResult> => {
    const { query, database } = options
    try {
        const sqlQuery = await getSqlQuery(options)
        try {
            return {
                query,
                sqlQuery,
                result: await runSqlQuery({ sqlQuery, database })
            }
        } catch (e) {
            const error = e as Error
            return { query, sqlQuery, error: error.message }
        }
    } catch (e) {
        const error = e as Error
        return { query, error: error.message }
    }
}
