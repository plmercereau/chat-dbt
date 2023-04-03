import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'

import { getConnectionStringFromEnv } from '@/cli/connection-string'
import { getSqlConnection } from '@/shared/sql-connection'

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
