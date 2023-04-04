import { Title, Table, Container } from '@mantine/core'
import { Prism } from '@mantine/prism'

import { ApiResult } from '@/pages/api/gpt-sql-query'
import { useStyles } from './styles'

export const Result: React.FC<{
    result?: ApiResult
    format: string
}> = ({ result, format }) => {
    const {
        classes: { code, flex }
    } = useStyles()

    if (!result?.length) return null

    return (
        <>
            <Title order={4}>Result</Title>
            {result.map((table, tableKey) => (
                <Container key={tableKey} className={flex}>
                    {format === 'json' && (
                        <Prism classNames={{ code }} language='json'>
                            {JSON.stringify(table?.rows, null, 2)}
                        </Prism>
                    )}
                    {format === 'table' && (
                        <Table
                            striped
                            highlightOnHover
                            withBorder
                            withColumnBorders
                        >
                            <thead>
                                {table.columns?.map((col, colKey) => (
                                    <th key={`${tableKey}-${colKey}`}>
                                        {col.name}
                                    </th>
                                ))}
                            </thead>
                            <tbody>
                                {table.rows?.map((row, rowKey) => (
                                    <tr key={`${tableKey}-${rowKey}`}>
                                        {table.columns?.map((col, colKey) => (
                                            <td
                                                key={`${tableKey}-${rowKey}-${colKey}`}
                                            >
                                                {row[col.name]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Container>
            ))}
        </>
    )
}
