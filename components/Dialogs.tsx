import { Card } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { PropsWithChildren } from 'react'

import { Error } from '@/components/Error'
import { Result } from '@/components/Result'
import { SqlQuery } from '@/components/SqlQuery'
import { GptSqlResponse } from '@/shared/chat-gpt'
import { useStyles } from '@/utils'

export const Dialog: React.FC<PropsWithChildren<{ className: string }>> = ({
    children,
    className
}) => {
    return (
        <Card shadow='sm' padding='xs' withBorder className={className}>
            {children}
        </Card>
    )
}

export const LeftDialog: React.FC<PropsWithChildren> = ({ children }) => {
    const { classes } = useStyles()
    return <Dialog className={classes.left}>{children}</Dialog>
}

export const RightDialog: React.FC<PropsWithChildren> = ({ children }) => {
    const { classes } = useStyles()
    return <Dialog className={classes.right}>{children}</Dialog>
}

export const QueryDialog: React.FC<{ message: GptSqlResponse }> = ({
    message
}) => {
    const {
        classes: { code }
    } = useStyles()

    return (
        <RightDialog>
            <Prism classNames={{ code }} language='markdown'>
                {message.query}
            </Prism>
        </RightDialog>
    )
}

export const ResponseDialog: React.FC<{
    message: GptSqlResponse
    last: boolean
}> = ({ message, last }) => {
    if (!message.error && !message.sqlQuery) {
        return null
    }
    return (
        <LeftDialog>
            <SqlQuery query={message.sqlQuery} usage={message.usage} />
            {message.error && <Error message={message} active={last} />}
            {message.result && <Result result={message.result} />}
        </LeftDialog>
    )
}
