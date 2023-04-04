import { Title } from '@mantine/core'
import { Prism } from '@mantine/prism'

import { useStyles } from './styles'

export const SqlQuery: React.FC<{
    query?: string
}> = ({ query }) => {
    const {
        classes: { code }
    } = useStyles()

    if (!query) {
        return null
    }

    return (
        <>
            <Title order={4}>Query</Title>
            <Prism classNames={{ code }} language='sql'>
                {query}
            </Prism>
        </>
    )
}
