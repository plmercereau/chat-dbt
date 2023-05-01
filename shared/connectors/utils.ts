import { InvalidArgumentError } from '@commander-js/extra-typings'
import { Instrospection, ExtractOptional, RawSqlResult } from '../types'

const DATABASE_CONNECTIONS = ['postgres', 'clickhouse'] as const

type DatabaseConnectionType = (typeof DATABASE_CONNECTIONS)[number]

export type ParsedConnectionString = {
    protocol: DatabaseConnectionType
    username?: string
    password?: string
    hostname: string
    port?: string
    database?: string
    params?: Record<string, string>
}

export abstract class DatabaseConnection {
    public databaseConfig: ParsedConnectionString
    public connectionString: string
    public dialectName: string
    constructor({
        connectionString,
        dialectName,
        ...defaults
    }: ExtractOptional<ParsedConnectionString> & {
        connectionString: string
        dialectName: string
    }) {
        this.connectionString = connectionString
        this.dialectName = dialectName
        this.databaseConfig = parseConnectionString(connectionString, defaults)
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
    value: string,
    defaults: ExtractOptional<ParsedConnectionString> = {}
): ParsedConnectionString => {
    try {
        const result = new URL(value)
        if (!result) {
            throw new InvalidArgumentError(
                `Invalid database connection string.`
            )
        }
        const protocol = result.protocol.slice(0, -1) as DatabaseConnectionType
        if (!DATABASE_CONNECTIONS.includes(protocol)) {
            throw new InvalidArgumentError(
                `Invalid database connection type "${value}".`
            )
        }
        return {
            hostname: result.hostname,
            protocol,
            port: result.port || defaults.port,
            database: result.pathname || defaults.database,
            password: result.password || defaults.password,
            username: result.username || defaults.username,
            params: Object.fromEntries(result.searchParams.entries())
        }
    } catch {
        throw new InvalidArgumentError(`Invalid database connection string`)
    }
}
