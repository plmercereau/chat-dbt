/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    distDir: 'dist/web',
    env: {
        DATABASE_URL: `postgres://${process.env.DB_USER}:${
            process.env.DB_PASSWORD
        }@${process.env.DB_HOST}:${process.env.DB_HOST || 5432}/${
            process.env.DB_NAME
        }`
    }
}

module.exports = nextConfig
