import postgres, { Sql } from 'postgres'

let sql: Sql
export const getSqlConnection = (database: string) => {
    if (!sql) {
        sql = postgres(database, {
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
