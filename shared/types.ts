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

export type RawSqlResult = RowList<Row[]>
export type ColumnList<T = any> = (T extends string ? Column<T> : never)[]
export type Row = Record<string, any>

interface Column<T extends string> {
    name: T
    type: number
    table: number
    number: number
}

type RowList<T extends readonly any[]> = T & {
    columns: ColumnList<keyof T[number]>
    count: T['length']
}
