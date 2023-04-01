import { config } from 'dotenv'
// TODO either local or cloud
config({ path: '.env.local' })

// TODO remove
export const connectionString = `postgres://${process.env.DB_USER}:${
    process.env.DB_PASSWORD
}@${process.env.DB_HOST}:${process.env.DB_HOST || 5432}/${process.env.DB_NAME}`
