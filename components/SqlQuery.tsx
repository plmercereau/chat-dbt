import { Title } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { Fragment } from 'react'

import { useStyles } from '@/utils/styles'

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
        <Fragment>
            <Title order={4}>Query</Title>
            <Prism classNames={{ code }} language='sql'>
                {query}
            </Prism>
        </Fragment>
    )
}
