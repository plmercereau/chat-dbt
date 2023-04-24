import {
    ChatCompletionRequestMessage,
    CreateCompletionResponseUsage,
    OpenAIApi
} from 'openai'
import { ColumnList, Row, RowList } from 'postgres'

import { Instrospection, getIntrospection } from './introspection'
import { getSqlConnection } from './sql-connection'

export type GptSqlResultItem = {
    rows: RowList<(Row & Iterable<Row>)[]>
    columns?: ColumnList<any>
    count: number | null
}

export type GptSqlResponse = {
    query: string
    sqlQuery?: string
    result?: GptSqlResultItem[]
    error?: string
    usage?: CreateCompletionResponseUsage
}

export type MessageOptions = {
    query: string
    history?: GptSqlResponse[]
    historyMode: string
} & (
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
    historyMode,
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

export const runSqlQuery = async (options: {
    sqlQuery: string
    database: string
}): Promise<GptSqlResultItem[]> => {
    const { sqlQuery, database } = options
    const result = await getSqlConnection(database).unsafe(sqlQuery)
    return result.columns || result.length === 0
        ? // * Single result e.g. SELECT * FROM users
          [
              {
                  rows: result,
                  columns: result.columns,
                  count: result.count
              }
          ]
        : // * Multiple results e.g. SELECT * FROM users; SELECT * FROM posts
          result.map(item => ({
              columns: item.columns,
              rows: item as RowList<(Row & Iterable<Row>)[]>,
              count: item.count
          }))
}

export const runQuery = async (options: {
    openai: OpenAIApi
    model: string
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    database: string
    history?: GptSqlResponse[]
    historyMode: string
}): Promise<GptSqlResponse> => {
    const { query, database } = options
    try {
        const { sqlQuery, usage } = await getSqlQuery(options)
        try {
            const result = await runSqlQuery({ sqlQuery, database })
            return {
                query,
                sqlQuery,
                result,
                usage
            }
        } catch (e) {
            const error = e as Error
            return { query, sqlQuery, error: error.message, usage }
        }
    } catch (e) {
        const error = e as Error
        return { query, error: error.message }
    }
}
