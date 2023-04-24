import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

import { GptSqlResponse, runQuery } from '@/shared/chat-gpt'
import { getOptions, getSecrets } from '@/utils/options'

const { key, org, database } = getSecrets()
const { model } = getOptions()
const openai = new OpenAIApi(
    new Configuration({ apiKey: key, organization: org })
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GptSqlResponse>
) {
    // * Get the query
    const { query, history, historyMode } = req.body as {
        query?: string
        history?: GptSqlResponse[]
        historyMode: string
    }
    if (!query) {
        return res.status(400).json({ error: 'no request', query: '' })
    }
    const response = await runQuery({
        openai,
        model,
        query,
        database,
        history,
        historyMode
    })

    return res.status(response.error ? 500 : 200).json(response)
}
