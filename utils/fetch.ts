import { GptSqlResponse } from '@/shared/chat-gpt'
import { HistoryMode } from '@/shared/options'
import { Result } from '@/shared/result'

export const resultFetcher = async ({
    query,
    history,
    historyMode
}: {
    query: string
    history?: GptSqlResponse[]
    historyMode?: HistoryMode
}): Promise<GptSqlResponse> => {
    const response = await fetch('/api/gpt-sql-query', {
        body: JSON.stringify({ query, history, historyMode }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    const serializedResult = await response.json()
    return {
        ...serializedResult,
        result: new Result(serializedResult.result)
    }
}
