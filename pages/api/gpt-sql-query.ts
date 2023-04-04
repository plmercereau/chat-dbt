import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

import { GptSqlResponse, runQuery } from '@/shared/chat-gpt'
import { getOptions, getSecrets } from '@/utils/options'

const { apiKey, organization, database } = getSecrets()
const { model } = getOptions()
const openai = new OpenAIApi(new Configuration({ apiKey, organization }))

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GptSqlResponse>
) {
    // * Get the query
    const { query, context } = req.body as {
        query?: string
        context?: GptSqlResponse[]
    }
    if (!query) {
        return res.status(400).json({ error: 'no request', query: '' })
    }
    const response = await runQuery({
        openai,
        model,
        query,
        database,
        context
    })

    return res.status(response.error ? 500 : 200).json(response)
}
