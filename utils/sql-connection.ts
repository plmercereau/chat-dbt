import postgres, { Sql } from 'postgres'

let sql: Sql
export const getSqlConnection = () => {
    if (!sql) {
        sql = postgres(process.env.DATABASE_URL!, {
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
