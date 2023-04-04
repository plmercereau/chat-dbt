import { Card } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { PropsWithChildren } from 'react'

import { Error } from '@/components/Error'
import { Result } from '@/components/Result'
import { SqlQuery } from '@/components/SqlQuery'
import { useStyles } from '@/components/styles'
import { GptSqlResponse } from '@/shared/chat-gpt'

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

export const QueryDialog: React.FC<{ input: string }> = ({ input }) => {
    const {
        classes: { code }
    } = useStyles()

    return (
        <RightDialog>
            <Prism classNames={{ code }} language='markdown'>
                {input}
            </Prism>
        </RightDialog>
    )
}

export const ResponseDialog: React.FC<{ message: GptSqlResponse }> = ({
    message
}) => (
    <LeftDialog>
        <SqlQuery query={message.sqlQuery} />
        <Error error={message.error} />
        <Result result={message.result} />
    </LeftDialog>
)
