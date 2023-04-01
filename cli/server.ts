// server.js
import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'
import open from 'open'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const port = 3000

const app = next({
    dev: false,
    conf: { distDir: 'web' },
    dir: dirname(fileURLToPath(import.meta.url))
})
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    }).listen(port, async () => {
        const url = `http://localhost:${port}`
        console.log(`> Ready on ${url}`)
        open(url)
    })
})
