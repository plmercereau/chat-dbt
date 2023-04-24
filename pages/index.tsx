import {
    ActionIcon,
    Autocomplete,
    Flex,
    Loader,
    useMantineTheme
} from '@mantine/core'
import { useScrollIntoView } from '@mantine/hooks'
import { IconSend } from '@tabler/icons-react'
import { Fragment, useState } from 'react'

import { LeftDialog, QueryDialog, ResponseDialog } from '@/components/Dialogs'
import { fetcher } from '@/utils/fetch'
import { getOptions } from '@/utils/options'
import { useAppContext } from '@/utils/state'
import { useStyles } from '@/utils/styles'

const options = getOptions()

const Page: React.FC = () => {
    const { loading, setLoading, history, setHistory } = useAppContext()
    const [query, setQuery] = useState('')
    const previousQueries = [...new Set(history.map(i => i.query))].sort()

    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLInputElement>()
    const { classes } = useStyles()
    const theme = useMantineTheme()
    const getColor = (color: string) =>
        theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7]

    const run = async () => {
        targetRef.current?.dispatchEvent(
            new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Escape',
                keyCode: 27,
                which: 27
            })
        )
        scrollIntoView()
        setLoading(true)
        const currentHistory = [...history]
        setHistory([...currentHistory, { query }])
        const result = await fetcher({
            query,
            historyMode: options.historyMode,
            history: options.historyMode === 'none' ? undefined : currentHistory
        })
        setLoading(false)
        setHistory([...currentHistory, result])
        setQuery('')
        scrollIntoView()
    }

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
            <form
                onSubmit={e => {
                    e.preventDefault()
                    run()
                }}
            >
                <Autocomplete
                    ref={targetRef}
                    disabled={loading}
                    value={query}
                    data={previousQueries}
                    onChange={setQuery}
                    placeholder='Type request here'
                    rightSection={
                        <ActionIcon
                            color={getColor('blue')}
                            onClick={run}
                            disabled={loading}
                        >
                            <IconSend size='1.125rem' />
                        </ActionIcon>
                    }
                />
            </form>
        </Flex>
    )
}

export default Page
