import {
    Flex,
    Loader,
    Card,
    useMantineTheme,
    ActionIcon,
    Textarea
} from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { Prism } from '@mantine/prism'
import { IconSend } from '@tabler/icons-react'
import { PropsWithChildren, useEffect, useState } from 'react'

import { getOptions } from './_options'
import { ApiCallResponse } from './api/gpt-sql-query'
import { useStyles } from '@/components/styles'
import { Error } from '@/components/Error'
import { SqlQuery } from '@/components/SqlQuery'
import { Result } from '@/components/Result'

const options = getOptions()

const fetcher = async (query: string): Promise<ApiCallResponse> => {
    const response = await fetch('/api/gpt-sql-query', {
        body: JSON.stringify({ query }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
}

const Dialog: React.FC<PropsWithChildren<{ className: string }>> = ({
    children,
    className
}) => {
    return (
        <Card shadow='sm' padding='xs' withBorder className={className}>
            {children}
        </Card>
    )
}

const Page: React.FC = () => {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<
        Array<{ input: string } | ApiCallResponse>
    >([])

    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLInputElement>()

    const { classes } = useStyles()
    const theme = useMantineTheme()
    const getColor = (color: string) =>
        theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7]

    const submit = async () => {
        setLoading(true)
        setMessages([...messages, { input }])
        const q = input
        setInput('')
        scrollIntoView()

        const result = await fetcher(q)
        setLoading(false)
        setMessages([...messages, { input }, result])

        scrollIntoView()
        if (result.error) setInput(q)
        targetRef.current.focus()
    }

    useEffect(() => targetRef.current.focus())

    return (
        <Flex className={classes.flex} direction='column'>
            {messages.map((message, index) =>
                'input' in message ? (
                    <Dialog key={index} className={classes.right}>
                        <Prism
                            classNames={{
                                code: classes.code
                            }}
                            language='markdown'
                        >
                            {message.input}
                        </Prism>
                    </Dialog>
                ) : (
                    <Dialog key={index} className={classes.left}>
                        <SqlQuery query={message.sqlQuery} />
                        <Error error={message.error} />
                        <Result
                            result={message.result}
                            format={options.format}
                        />
                    </Dialog>
                )
            )}

            {loading && (
                <Dialog className={classes.left}>
                    <Loader />
                </Dialog>
            )}
            <Textarea
                disabled={loading}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        submit()
                    }
                }}
                placeholder='Type request here'
                autosize
                rightSection={
                    <ActionIcon
                        color={getColor('blue')}
                        onClick={submit}
                        disabled={loading}
                    >
                        <IconSend size='1.125rem' />
                    </ActionIcon>
                }
            />
            <div ref={targetRef} />
        </Flex>
    )
}

export default Page
