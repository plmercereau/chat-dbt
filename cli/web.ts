import { createServer } from 'http'
import next from 'next'
import open from 'open'
import { dirname } from 'path'
import { parse, fileURLToPath } from 'url'

import { WebOptions } from './index'

export const startWeb = async ({ port, browser, ...rest }: WebOptions) => {
    const { apiKey, organization, database, ...options } = rest
    const app = next({
        dev: false,
        conf: {
            distDir: 'web',
            serverRuntimeConfig: { apiKey, organization, database },
            publicRuntimeConfig: options
        },
        dir: dirname(fileURLToPath(import.meta.url))
    })
    const handle = app.getRequestHandler()
    await app.prepare()
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    })
    server.listen(port, async () => {
        const url = `http://localhost:${port}`
        console.log(`> Ready on ${url}`)
        if (browser) {
            open(url)
        }
    })
}
