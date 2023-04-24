/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
    reactStrictMode: true,
    distDir: 'dist/web',
    // * Load options from environment variables
    /** @type {import('./cli').SecretOptions} */
    serverRuntimeConfig: {
        database: process.env.DB_CONNECTION_STRING,
        key: process.env.OPENAI_API_KEY,
        org: process.env.OPENAI_ORGANIZATION
    },
    /** @type {import('./cli').PublicOptions} */
    publicRuntimeConfig: {
        format: 'table',
        model: 'gpt-4',
        confirm: false,
        autoCorrect: 0,
        historyMode: 'all'
    }
}
