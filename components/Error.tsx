import { getErrorPrompt } from '@/shared/error'
import { fetcher } from '@/utils/fetch'
import { useAppContext } from '@/utils/state'
import { Button, Container, Group, Title } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { MouseEventHandler } from 'react'

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
        const query = getErrorPrompt(error)
        const currentHistory = [...history]
        setHistory([...currentHistory, { query }])

        // * Get number of errors after the last successful query + 1 (index starts at 0)
        const contextSize =
            currentHistory.reverse().findIndex(m => !m.error) + 1

        const result = await fetcher({
            query,
            // * Get all the queries after the last successful query
            context: currentHistory.slice(-contextSize)
        })
        setLoading(false)
        setHistory([...currentHistory, result])
    }

    return (
        <>
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
        </>
    )
}
