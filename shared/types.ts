export type Instrospection = Record<
    string,
    {
        description?: string
        columns: Record<
            string,
            {
                type: string
                description?: string
                required: boolean
            }
        >
    }
>

// TODO minimise the types below
export type RawSqlResult = RowList<Row[]>
export type ColumnList<T = any> = (T extends string ? Column<T> : never)[]
export type Row = Record<string, any>

interface Column<T extends string> {
    name: T
    type: number
    table: number
    number: number
    parser?: ((raw: string) => unknown) | undefined
}

interface ResultQueryMeta<T extends number | null, U> extends ResultMeta<T> {
    columns: ColumnList<U>
}
interface ResultMeta<T extends number | null> {
    count: T // For tuples
    command: string
    statement: Statement
    state: State
}
interface Statement {
    /** statement unique name */
    name: string
    /** sql query */
    string: string
    /** parameters types */
    types: number[]
    columns: ColumnList<string>
}
interface State {
    status: string
    pid: number
    secret: number
}

type RowList<T extends readonly any[]> = T &
    Iterable<NonNullable<T[number]>> &
    ResultQueryMeta<T['length'], keyof T[number]>
