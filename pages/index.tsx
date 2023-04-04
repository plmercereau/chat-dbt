import {
    ActionIcon,
    Flex,
    Loader,
    Textarea,
    useMantineTheme
} from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { IconSend } from '@tabler/icons-react'
import { Fragment, useEffect, useState } from 'react'

import { LeftDialog, QueryDialog, ResponseDialog } from '@/components/Dialogs'
import { useStyles } from '@/utils/styles'
import { useAppContext } from '@/utils/state'
import { fetcher } from '@/utils/fetch'
import React from 'react'

const Page: React.FC = () => {
    const { loading, setLoading, history, setHistory } = useAppContext()
    const [query, setQuery] = useState('')
    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLInputElement>()

    const { classes } = useStyles()
    const theme = useMantineTheme()
    const getColor = (color: string) =>
        theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7]

    const submit = async () => {
        setLoading(true)
        const currentHistory = [...history]
        setHistory([...currentHistory, { query }])

        const result = await fetcher({ query })
        setLoading(false)
        setHistory([...currentHistory, result])
        setQuery('')
    }

    useEffect(() => {
        if (!loading) {
            scrollIntoView()
            targetRef.current.focus()
        }
    }, [targetRef, loading, scrollIntoView])

    return (
        <Flex className={classes.flex} direction='column'>
            {history.map((message, index) => (
                <Fragment key={index}>
                    <QueryDialog message={message} />
                    <ResponseDialog
                        key={'a-' + index}
                        message={message}
                        last={index === history.length - 1}
                    />
                </Fragment>
            ))}
            {loading && (
                <LeftDialog>
                    <Loader />
                </LeftDialog>
            )}
            <Textarea
                disabled={loading}
                value={query}
                onChange={e => setQuery(e.target.value)}
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
