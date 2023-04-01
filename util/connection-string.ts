import { config } from 'dotenv'
// TODO either local or cloud
config({ path: '.env.local' })

export const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/postgres`
