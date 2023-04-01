import postgres, { Sql } from 'postgres'
import { connectionString } from './connection-string'

let sql: Sql
export const getSqlConnection = () => {
    if (!sql) {
        sql = postgres(connectionString, {
            // ssl: 'require',
            max: 1
        })
    }
    return sql
}

export const closeSqlConnection = async () => {
    if (sql) {
        await sql.end()
    }
}
