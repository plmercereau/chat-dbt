/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
    reactStrictMode: true,
    distDir: 'dist/web',
    // * Load options from environment variables
    serverRuntimeConfig: {
        connectionString: process.env.DB_CONNECTION_STRING,
        key: process.env.OPENAI_API_KEY,
        org: process.env.OPENAI_ORGANIZATION
    },
    publicRuntimeConfig: {
        format: 'table',
        model: 'gpt-4',
        confirm: false,
        autoCorrect: 0,
        historyMode: 'all'
    }
}
