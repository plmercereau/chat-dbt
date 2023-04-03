import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import { Row, RowList } from 'postgres'

import { getIntrospection } from './introspection'
import { getSqlConnection } from './sql-connection'

export type GptSqlResult = {
    query: string
    sqlQuery?: string
    result?: RowList<(Row & Iterable<Row>)[]>
    error?: string
}

export const createMessages = async ({
    query,
    database,
    history
}: {
    query: string
    database: string
    history?: GptSqlResult[]
}): Promise<ChatCompletionRequestMessage[]> => {
    // * Get the SQL introspection
    const schema = JSON.stringify(await getIntrospection(database), null, 0)

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

export const executeQuery = async ({
    openai,
    query,
    database,
    history
}: {
    openai: OpenAIApi
    /** @example Number of users who have a first name starting with 'A' */
    query: string
    database: string
    history?: GptSqlResult[]
}): Promise<GptSqlResult> => {
    try {
        // * Query OpenAI
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: await createMessages({
                database,
                query,
                history
            }),
            temperature: 0
        })
        const sqlQuery = completion.data.choices[0].message?.content
        if (!sqlQuery) {
            throw new Error('empty response')
        }
        try {
            const sql = getSqlConnection(database)
            // * 5. Run the SQL query
            return { query, sqlQuery, result: await sql.unsafe(sqlQuery) }
        } catch (e) {
            const error = e as Error
            return { query, sqlQuery, error: error.message }
        }
    } catch (e) {
        const error = e as Error
        return { query, error: error.message }
    }
}
