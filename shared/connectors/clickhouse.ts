import { createClient, ClickHouseClient } from '@clickhouse/client'

import { Instrospection, RawSqlResult } from '../types'
import { DatabaseConnection } from './utils'

export class ClickHouseDatabaseConnection extends DatabaseConnection {
    constructor(connectionString: string) {
        super({
            connectionString,
            dialectName: 'ClickHouse SQL',
            database: 'default'
        })
    }

    private _client?: ClickHouseClient
    private async getClient() {
        if (!this._client) {
            const {
                hostname,
                username,
                password,
                database = undefined,
                params = {}
            } = this.databaseConfig

            this._client = createClient({
                host:
                    (params.secure === 'true' ? 'https://' : 'http://') +
                    hostname,
                username,
                password,
                database
            })
        }
        return this._client
    }

    async getIntrospection() {
        const client = await this.getClient()
        const query = await client.query({
            query: `
        SELECT 
            table as table_name,
            name as column_name,
            type as column_type,
            default_expression AS column_default
        FROM system.columns
        WHERE database = {database: String}
        -- AND engine != 'MaterializedView' AND table_schema = 'public'
        `,
            query_params: { database: this.databaseConfig.database }
        })
        const result: {
            data: Array<{
                table_name: string
                column_name: string
                column_type: string
                column_default: string
                // column_is_nullable: not supported?
                // column_description: not supported?
                // table_description: not supported?
            }>
        } = await query.json()
        const introspection: Instrospection = {}
        result.data.forEach(column => {
            if (!introspection[column.table_name]) {
                introspection[column.table_name] = {
                    columns: {}
                }
            }
            introspection[column.table_name].columns[column.column_name] = {
                type: column.column_type,
                required: !column.column_default
            }
        })
        return introspection
    }

    async runSqlQuery(sqlQuery: string): Promise<RawSqlResult> {
        const client = await this.getClient()
        const query = await client.query({ query: sqlQuery })
        const result: any = await query.json()
        const res = [...result.data] as RawSqlResult
        res.columns = result.meta
        res.count = result.rows
        return res
    }
}
