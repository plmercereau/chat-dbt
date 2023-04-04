import {
    ActionIcon,
    Flex,
    Loader,
    Textarea,
    useMantineTheme
} from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { IconSend } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { LeftDialog, QueryDialog, ResponseDialog } from '@/components/Dialogs'
import { useStyles } from '@/components/styles'
import { ApiCallResponse } from './api/gpt-sql-query'

const fetcher = async (query: string): Promise<ApiCallResponse> => {
    const response = await fetch('/api/gpt-sql-query', {
        body: JSON.stringify({ query }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
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
                    <QueryDialog key={index} input={message.input} />
                ) : (
                    <ResponseDialog key={index} message={message} />
                )
            )}
            {loading && (
                <LeftDialog>
                    <Loader />
                </LeftDialog>
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
