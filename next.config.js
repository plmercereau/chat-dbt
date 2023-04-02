/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    distDir: 'dist/web',
    env: {
        DATABASE_URL: `postgres://${process.env.POSTGRES_USER}:${
            process.env.POSTGRES_PASSWORD
        }@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_HOST || 5432}/${
            process.env.POSTGRES_DB
        }`
    }
}

module.exports = nextConfig
