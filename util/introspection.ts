import { getSqlConnection } from './sql-connection'

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

export const getIntrospection = async () => {
    const sql = getSqlConnection()
    const result = await sql<
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
