/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
    reactStrictMode: true,
    distDir: 'dist/web',
    // * Load options from environment variables
    /** @type {import('./cli').SecretOptions} */
    serverRuntimeConfig: {
        database: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION
    },
    /** @type {import('./cli').PublicOptions} */
    publicRuntimeConfig: {
        format: 'table'
    }
}
