import { GptSqlResponse, HistoryMode } from '@/shared'

export const fetcher = async ({
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
    return response.json()
}
