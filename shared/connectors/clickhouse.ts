import { DatabaseConnection } from './utils'
import { Instrospection, RawSqlResult } from '../types'

export class ClickHouseDatabaseConnection extends DatabaseConnection {
    constructor(connectionString: string) {
        super(connectionString, 'ClickHouse SQL')
    }

    async getIntrospection() {
        throw new Error('Not implemented yet')
        return null as unknown as Instrospection
    }

    async runSqlQuery(sqlQuery: string): Promise<RawSqlResult> {
        throw new Error('Not implemented yet')
        return null as unknown as RawSqlResult
    }
}
