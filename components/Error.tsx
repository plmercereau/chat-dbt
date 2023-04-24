import { Button, Container, Group, Title } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { Fragment, MouseEventHandler } from 'react'

import { ERROR_PROMPT } from '@/shared/error'
import { fetcher, useAppContext } from '@/utils'

export const Error: React.FC<{
    error?: string
    active: boolean
}> = ({ error, active }) => {
    const { history, setHistory, loading, setLoading } = useAppContext()
    if (!error) {
        return null
    }

    const askCorrection: MouseEventHandler<HTMLButtonElement> = async () => {
        setLoading(true)
        const query = ERROR_PROMPT
        const currentHistory = [...history]
        setHistory([...currentHistory, { query }])

        // * Get number of errors after the last successful query + 1 (index starts at 0)
        const historySize =
            currentHistory.reverse().findIndex(m => !m.error) + 1

        const result = await fetcher({
            query,
            // * Get all the queries after the last successful query
            history: currentHistory.slice(-historySize)
        })
        setLoading(false) // TODO this does not re-focus the input
        setHistory([...currentHistory, result])
    }

    return (
        <Fragment>
            <Title order={4}>Error</Title>
            <Container>{error}</Container>
            {active && !loading && (
                <Group position='center' mt='xs'>
                    <Button
                        onClick={askCorrection}
                        variant='default'
                        leftIcon={<IconRefresh size='1rem' />}
                    >
                        Ask correction
                    </Button>
                </Group>
            )}
        </Fragment>
    )
}
