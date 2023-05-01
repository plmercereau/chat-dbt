import { ClickHouseDatabaseConnection } from './clickhouse'
import { PostgresDatabaseConnection } from './postgres'
import { DatabaseConnection, parseConnectionString } from './utils'

export const createDatabaseConnection = (
    connectionString: string
): DatabaseConnection => {
    const config = parseConnectionString(connectionString)
    switch (config.protocol) {
        case 'postgres':
            return new PostgresDatabaseConnection(connectionString)
        case 'clickhouse':
            return new ClickHouseDatabaseConnection(connectionString)
    }
}

export { parseConnectionString }
