import { Button, Container, Group, Title } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { Fragment, MouseEventHandler } from 'react'

import { GptSqlResponse } from '@/shared/chat-gpt'
import { ERROR_PROMPT } from '@/shared/error'
import { resultFetcher, useAppContext } from '@/utils'

export const Error: React.FC<{
    message: GptSqlResponse
    active: boolean
}> = ({ message, active }) => {
    const { history, setHistory, loading, setLoading } = useAppContext()

    /**
     * Ask OpenAI to correct the last SQL query that failed
     */
    const askCorrection: MouseEventHandler<HTMLButtonElement> = async () => {
        setLoading(true)
        const query = ERROR_PROMPT
        const currentHistory = [...history]
        setHistory([...currentHistory, { query }])

        // * Get number of errors after the last successful query + 1 (index starts at 0)
        const historySize =
            currentHistory.reverse().findIndex(m => !m.error) + 1

        const result = await resultFetcher({
            query,
            // * Get all the queries after the last successful query
            history: currentHistory.slice(-historySize)
        })
        setLoading(false) // TODO this does not re-focus the input
        setHistory([...currentHistory, result])
    }

    /**
     * Retry the last query that failed before OpenAI had the chance to give a valid response,
     * for instance when the database could not be reach to get the schema
     */
    const retry: MouseEventHandler<HTMLButtonElement> = async () => {
        setLoading(true)
        const previousRequests = history.slice(0, -1)
        const currentRequest = history.slice(-1)[0]

        const result = await resultFetcher({
            query: currentRequest!.query,
            history: previousRequests
        })
        setLoading(false)
        setHistory([...previousRequests, result])
    }

    return (
        <Fragment>
            <Title order={4}>Error</Title>
            <Container>{message.error}</Container>
            {active && !loading && (
                <Group position='center' mt='xs'>
                    {(message.sqlQuery && (
                        <Button
                            onClick={askCorrection}
                            variant='default'
                            leftIcon={<IconRefresh size='1rem' />}
                        >
                            Ask correction
                        </Button>
                    )) || (
                        <Button
                            onClick={retry}
                            variant='default'
                            leftIcon={<IconRefresh size='1rem' />}
                        >
                            Retry
                        </Button>
                    )}
                </Group>
            )}
        </Fragment>
    )
}
