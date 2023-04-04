import { GptSqlResponse } from '@/shared/chat-gpt'

export const fetcher = async ({
    query,
    context
}: {
    query: string
    context?: GptSqlResponse[]
}): Promise<GptSqlResponse> => {
    const response = await fetch('/api/gpt-sql-query', {
        body: JSON.stringify({ query, context }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
}
