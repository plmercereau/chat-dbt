import postgres, { Sql } from 'postgres'
import { DatabaseConnection } from './utils'
import { Instrospection, RawSqlResult } from '../types'

export class PostgresDatabaseConnection extends DatabaseConnection {
    constructor(connectionString: string) {
        super(connectionString, 'Postgres SQL')
    }
    private _connection?: Sql
    private get connection() {
        if (!this._connection) {
            this._connection = postgres(this.connectionString, {
                // ssl: 'require',
                max: 1
            })
        }
        return this._connection
    }

    async getIntrospection() {
        const result = await this.connection<
            {
                table_name: string
                column_name: string
                column_type: string
                column_description?: string
                table_description: string
                column_default: string | null
                column_is_nullable: 'YES' | 'NO'
            }[]
        >`SELECT 
            table_name, 
            column_name, 
            data_type as column_type,
            column_default,
            is_nullable as column_is_nullable,
            col_description(format('%s.%s',table_schema,table_name)::regclass::oid,ordinal_position) as column_description,
            obj_description(format('%s.%s',table_schema,table_name)::regclass) as table_description
    FROM information_schema.columns
    WHERE table_schema = 'public';
    `
        return result.reduce<Instrospection>(
            (
                agg,
                {
                    table_name,
                    column_description,
                    column_name,
                    column_type,
                    column_default,
                    column_is_nullable,
                    table_description
                }
            ) => {
                if (!agg[table_name]) {
                    agg[table_name] = {
                        columns: {},
                        description: table_description
                    }
                }
                agg[table_name].columns[column_name] = {
                    type: column_type,
                    description: column_description,
                    required: column_is_nullable === 'NO' && !column_default
                }
                return agg
            },
            {}
        )
    }

    async runSqlQuery(sqlQuery: string): Promise<RawSqlResult> {
        return this.connection.unsafe(sqlQuery)
    }
}
