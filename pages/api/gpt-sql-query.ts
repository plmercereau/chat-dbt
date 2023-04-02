import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'
import { GptSqlResult, executeQuery } from '@/utils/chat-gpt'

const openai = new OpenAIApi(
    new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION
    })
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GptSqlResult>
) {
    // * Get the query
    const { query } = req.body
    if (!query) {
        return res.status(400).json({ error: 'no request' })
    }
    const result = await executeQuery({
        openai,
        query,
        database: process.env.DATABASE_URL!
    })
    return res.status(result.error ? 500 : 200).json(result)
}
