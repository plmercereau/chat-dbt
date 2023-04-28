import { getSqlConnection } from '@/shared/sql-connection'
import { CLIResult } from './result'

export const runSqlQuery = async (options: {
    sqlQuery: string
    database: string
}): Promise<CLIResult> => {
    const { sqlQuery, database } = options
    return new CLIResult(await getSqlConnection(database).unsafe(sqlQuery))
}
