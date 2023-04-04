import { Container, Title } from '@mantine/core'

export const Error: React.FC<{
    error?: string
}> = ({ error }) => {
    if (!error) {
        return null
    }
    return (
        <>
            <Title order={4}>Error</Title>
            <Container>{error}</Container>
        </>
    )
}
