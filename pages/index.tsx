import { PropsWithChildren, useEffect, useState } from 'react'
import {
    createStyles,
    Flex,
    Loader,
    Card,
    useMantineTheme,
    ActionIcon,
    Title,
    Textarea
} from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useScrollIntoView } from '@mantine/hooks'
import { IconSend } from '@tabler/icons-react'

import { GptSqlResult } from '@/utils/chat-gpt'

const fetcher = async (query: string): Promise<GptSqlResult> => {
    const response = await fetch('/api/gpt-sql-query', {
        body: JSON.stringify({ query }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
}

const useStyles = createStyles(theme => {
    return {
        code: {
            paddingRight: '30px',
            whiteSpace: 'pre-wrap'
        },
        left: {
            alignSelf: 'flex-start',
            borderRadius: '0px 10px 10px 10px',
            maxWidth: '100%'
        },
        right: {
            alignSelf: 'flex-end',
            borderRadius: '10px 0px 10px 10px',
            maxWidth: '100%'
        },
        flex: {
            padding: theme.spacing.xs,
            gap: theme.spacing.xs
        }
    }
})

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
        Array<{ input: string } | GptSqlResult>
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
                        {message.query && (
                            <>
                                <Title order={4}>Query</Title>
                                <Prism
                                    classNames={{
                                        code: classes.code
                                    }}
                                    language='sql'
                                >
                                    {message.query}
                                </Prism>
                            </>
                        )}
                        {message.error && (
                            <>
                                <Title order={4}>Error</Title>
                                {message.error}
                            </>
                        )}
                        {message.result && (
                            <>
                                <Title order={4}>Result</Title>
                                <Prism
                                    classNames={{
                                        code: classes.code
                                    }}
                                    language='json'
                                >
                                    {JSON.stringify(message.result, null, 2)}
                                </Prism>
                            </>
                        )}
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
