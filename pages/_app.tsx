import { AppProps } from 'next/app'
import Head from 'next/head'
import { MantineProvider } from '@mantine/core'
import { AppWrapper } from '../utils/state'
import { useColorScheme } from '@mantine/hooks'

export default function App(props: AppProps) {
    const { Component, pageProps } = props
    const colorScheme = useColorScheme()

    return (
        <>
            <Head>
                <title>Chat DBT</title>
                <meta
                    name='viewport'
                    content='minimum-scale=1, initial-scale=1, width=device-width'
                />
            </Head>

            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{ colorScheme }}
            >
                <AppWrapper>
                    <Component {...pageProps} />
                </AppWrapper>
            </MantineProvider>
        </>
    )
}
