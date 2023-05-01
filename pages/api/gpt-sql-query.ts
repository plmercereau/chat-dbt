import type { NextApiRequest, NextApiResponse } from 'next'

import { getOptions, getSecrets } from '@/utils'
import { GptSqlResponse, getSqlQuery } from '@/shared/chat-gpt'
import { initOpenAI } from '@/shared/openai'
import { HistoryMode } from '@/shared/options'
import { Result } from '@/shared/result'
import { createDatabaseConnection } from '@/shared/connectors'

const { key, org, database } = getSecrets()
const { model } = getOptions()
const openai = initOpenAI(key, org)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
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

    const dbConnection = createDatabaseConnection(database)
    try {
        const { sqlQuery, usage } = await getSqlQuery({
            openai,
            model,
            query,
            dbConnection,
            history,
            historyMode
        })

        try {
            const result = new Result(await dbConnection.runSqlQuery(sqlQuery))
            return res.status(200).json({
                query,
                sqlQuery,
                result: result.serialize(),
                usage
            })
        } catch (e) {
            const error = e as Error
            return res
                .status(500)
                .json({ query, sqlQuery, error: error.message, usage })
        }
    } catch (e) {
        const error = e as Error
        return res.status(500).json({ query, error: error.message })
    }
}
