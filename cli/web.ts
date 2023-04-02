import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'
import open from 'open'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { WebOptions } from './index'

export const startWeb = async ({
    port,
    browser,
    database,
    apiKey,
    organization
}: WebOptions) => {
    const app = next({
        dev: false,
        conf: {
            distDir: 'web',
            env: {
                DATABASE_URL: database,
                OPENAI_API_KEY: apiKey,
                OPENAI_ORGANIZATION: organization
            }
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
