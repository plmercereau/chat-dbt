import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

import { GptSqlResult, runQuery } from '@/shared/chat-gpt'
import { getOptions, getSecrets } from '../_options'
import { ColumnList, Row, RowList } from 'postgres'

const { apiKey, organization, database } = getSecrets()
const { model } = getOptions()
const openai = new OpenAIApi(new Configuration({ apiKey, organization }))

export type ApiResult = Array<{
    rows?: RowList<(Row & Iterable<Row>)[]>
    columns?: ColumnList<any>
}>

export type ApiCallResponse = Omit<GptSqlResult, 'result'> & {
    result?: ApiResult
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiCallResponse>
) {
    // * Get the query
    const { query } = req.body
    if (!query) {
        return res.status(400).json({ error: 'no request', query })
    }
    const { error, result, sqlQuery } = await runQuery({
        openai,
        model,
        query,
        database
    })

    return res.status(error ? 500 : 200).json({
        query,
        sqlQuery,
        error,
        result: result?.columns
            ? // * Single result e.g. SELECT * FROM users
              [
                  {
                      rows: result,
                      columns: result?.columns
                  }
              ]
            : result?.length
            ? // * Multiple results e.g. SELECT * FROM users; SELECT * FROM posts
              result.map(table => ({
                  rows: table as RowList<(Row & Iterable<Row>)[]>,
                  columns: table?.columns
              }))
            : // * No results e.g. INSERT INTO users (name) VALUES ('John')
              []
    })
}
