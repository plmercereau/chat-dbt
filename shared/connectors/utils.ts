import { InvalidArgumentError } from '@commander-js/extra-typings'
import { Instrospection, RawSqlResult } from '../types'

const DATABASE_CONNECTIONS = ['postgres', 'clickhouse'] as const

type DatabaseConnectionType = (typeof DATABASE_CONNECTIONS)[number]

export type ParsedConnectionString = {
    protocol: DatabaseConnectionType
    username?: string
    password?: string
    hostname: string
    port?: string
    database: string
}

export abstract class DatabaseConnection {
    public databaseConfig: ParsedConnectionString
    constructor(public connectionString: string, public dialectName: string) {
        this.databaseConfig = parseConnectionString(connectionString)
        if (this.constructor === DatabaseConnection) {
            throw new Error('DatabaseConnection is abstract')
        }
    }
    getIntrospection(): Promise<Instrospection> {
        throw new Error('Method not implemented.')
    }
    runSqlQuery(_sqlQuery: string): Promise<RawSqlResult> {
        throw new Error('Method not implemented.')
    }
}

export const parseConnectionString = (
    value: string
): ParsedConnectionString => {
    try {
        const re =
            /^(?:(?<protocol>[^:\/?#\s]+):\/{2})?(?:((?<username>[^@\/?#\s]+)(?::(?<password>[^@\/?#\s]+)))@)?((?<hostname>[^\/?#\s]+)(?::(?<port>[0-9]+)))?(?:\/(?<database>[^?#\s]*))?(?:[?]([^#\s]+))?\S*$/
        const result = re.exec(value)?.groups as
            | ParsedConnectionString
            | undefined
        if (!result) {
            throw new InvalidArgumentError(
                `Invalid database connection string.`
            )
        }
        if (!DATABASE_CONNECTIONS.includes(result?.protocol)) {
            throw new InvalidArgumentError(
                `Invalid database connection type "${value}".`
            )
        }
        return result
    } catch {
        throw new InvalidArgumentError(`Invalid database connection string`)
    }
}
