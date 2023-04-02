import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from 'dotenv'
import { getSqlConnection } from '@/utils/sql-connection'
import { getConnectionStringFromEnv } from '@/utils/connection-string'

config({ path: '.env.local' })
const connectionString = getConnectionStringFromEnv()
if (!connectionString) {
    throw new Error('No connection string found')
}

const db = drizzle(getSqlConnection(connectionString))
const main = async () => {
    await migrate(db, { migrationsFolder: 'demo/migrations' })

    process.exit(0)
}
main()
