import { getIntrospection } from '@/utils/introspection'
import { getSqlConnection } from '@/utils/sql-connection'
import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import { Row, RowList } from 'postgres'

export type GptSqlResult = {
    query?: string
    result?: RowList<(Row & Iterable<Row>)[]>
    error?: string
}

const parseValue = (value: any) => {
    if (typeof value !== 'string') {
        return value
    }
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export const createMessages = async ({
    query,
    database
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
        },
        {
            role: 'user',
            content: query
        }
    ]

    return messages
}

export const executeQuery = async ({
    openai,
    query: humanQuery,
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
                query: humanQuery,
                history
            }),
            temperature: 0
        })
        const query = completion.data.choices[0].message?.content
        if (!query) {
            throw new Error('empty response')
        }
        try {
            const sql = getSqlConnection(database)
            // * 5. Run the SQL query
            return { query, result: await sql.unsafe(query) }
        } catch (e) {
            const error = e as Error
            return { query, error: error.message }
        }
    } catch (e) {
        const error = e as Error
        return { error: error.message }
    }
}
