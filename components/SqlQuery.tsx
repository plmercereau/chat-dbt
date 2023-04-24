import { Badge, Title } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { Fragment } from 'react'

import { useStyles } from '@/utils/styles'
import { CreateCompletionResponseUsage } from 'openai'

export const SqlQuery: React.FC<{
    query?: string
    usage?: CreateCompletionResponseUsage
}> = ({ query, usage }) => {
    const {
        classes: { code }
    } = useStyles()

    if (!query) {
        return null
    }

    return (
        <Fragment>
            <Title order={4}>
                Query
                {usage && (
                    <sup style={{ paddingLeft: '10px' }}>
                        <Badge>{usage.total_tokens} tokens</Badge>
                    </sup>
                )}
            </Title>
            <Prism classNames={{ code }} language='sql'>
                {query}
            </Prism>
        </Fragment>
    )
}
