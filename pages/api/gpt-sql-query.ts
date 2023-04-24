import type { NextApiRequest, NextApiResponse } from 'next'

import { getOptions, getSecrets } from '@/utils'
import { GptSqlResponse, runQuery, initOpenAI, HistoryMode } from '@/shared'

const { key, org, database } = getSecrets()
const { model } = getOptions()
const openai = initOpenAI(key, org)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GptSqlResponse>
) {
    // * Get the query
    const { query, history, historyMode } = req.body as {
        query?: string
        history?: GptSqlResponse[]
        historyMode: HistoryMode
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
