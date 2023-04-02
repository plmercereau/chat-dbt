import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env.local' })

const connectionString = `postgres://${process.env.POSTGRES_USER}:${
    process.env.POSTGRES_PASSWORD
}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || 5432}/${
    process.env.POSTGRES_DB
}`

const db = drizzle(
    postgres(connectionString, {
        // ssl: 'require',
        max: 1
    })
)
const main = async () => {
    await migrate(db, { migrationsFolder: 'demo/migrations' })

    process.exit(0)
}
main()
