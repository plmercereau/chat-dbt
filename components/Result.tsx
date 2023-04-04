import { Title, Table, Container, Group, SegmentedControl } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useState } from 'react'

import { ApiResult } from '@/pages/api/gpt-sql-query'
import { useStyles } from './styles'
import { getOptions } from '@/pages/_options'

const options = getOptions()

export const Result: React.FC<{
    result?: ApiResult
}> = ({ result }) => {
    const {
        classes: { code, flex }
    } = useStyles()
    // ? keep the max width of the component
    const [format, setFormat] = useState(options.format)

    if (!result?.length) return null
    return (
        <div>
            <Title order={4}>Result</Title>
            <Group position='center'>
                <SegmentedControl
                    radius='sm'
                    value={format}
                    onChange={setFormat}
                    data={[
                        { label: 'Table', value: 'table' },
                        { label: 'JSON', value: 'json' }
                    ]}
                />
            </Group>
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
        </div>
    )
}
