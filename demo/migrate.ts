import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { connectionString } from '../utils/connection-string'

const db = drizzle(
    postgres(connectionString, {
        // ssl: 'require',
        max: 1
    })
)
const main = async () => {
    await migrate(db, { migrationsFolder: 'migrations' })

    process.exit(0)
}
main()
