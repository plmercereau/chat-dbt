import {
    Title,
    Table,
    Container,
    Group,
    SegmentedControl,
    TableProps
} from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useState } from 'react'

import { useStyles } from './styles'
import { getOptions } from '@/pages/_options'
import { GptSqlResultItem } from '@/shared/chat-gpt'

const options = getOptions()

const JsonResult: React.FC<GptSqlResultItem> = ({ count, rows, columns }) => {
    const {
        classes: { code }
    } = useStyles()
    return (
        <Prism classNames={{ code }} language='json'>
            {JSON.stringify(columns ? rows : { count }, null, 2)}
        </Prism>
    )
}

const TableResult: React.FC<GptSqlResultItem> = ({ count, rows, columns }) => {
    const props: TableProps = {
        striped: true,
        highlightOnHover: true,
        withBorder: true,
        withColumnBorders: true
    }
    if (columns === undefined)
        return (
            <Table {...props}>
                <thead>
                    <tr>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{count}</td>
                    </tr>
                </tbody>
            </Table>
        )
    return (
        <Table {...props}>
            <thead>
                <tr>
                    {columns.map((col, colKey) => (
                        <th key={colKey}>{col.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowKey) => (
                    <tr key={rowKey}>
                        {columns?.map((col, colKey) => (
                            <td key={`${rowKey}-${colKey}`}>{row[col.name]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const ItemResult: React.FC<{
    item: GptSqlResultItem
    index: number
    total: number
}> = ({ item, index, total }) => {
    // ? keep the max width of the component
    const [format, setFormat] = useState(options.format)
    const { classes } = useStyles()
    return (
        <>
            <Title order={4}>
                {total > 1 ? `Result ${index + 1}` : 'Result'}
            </Title>
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
            <Container className={classes.flex}>
                {format === 'json' && <JsonResult {...item} />}
                {format === 'table' && <TableResult {...item} />}
            </Container>
        </>
    )
}

export const Result: React.FC<{
    result?: GptSqlResultItem[]
}> = ({ result }) => {
    if (!result?.length) return null
    return (
        <>
            {result.map((item, tableKey) => (
                <ItemResult
                    key={tableKey}
                    index={tableKey}
                    total={result.length}
                    item={item}
                />
            ))}
        </>
    )
}
