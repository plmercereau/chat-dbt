import {
    Title,
    Table,
    Container,
    Group,
    SegmentedControl,
    TableProps
} from '@mantine/core'
import { Prism } from '@mantine/prism'
import { Fragment, PropsWithChildren, useState } from 'react'

import { useStyles } from '@/utils/styles'
import { getOptions } from '@/utils/options'
import { GptSqlResultItem } from '@/shared/chat-gpt'

const options = getOptions()

const JsonResult: React.FC<GptSqlResultItem> = ({ count, rows, columns }) => {
    const {
        classes: { code }
    } = useStyles()
    return (
        <Prism classNames={{ code }} language='json'>
            {JSON.stringify(
                columns ? rows : count === null ? true : count,
                null,
                2
            )}
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

    if (count === null) {
        return <div>Success</div>
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

const ResultContainer: React.FC<
    PropsWithChildren<{ index: number; total: number }>
> = ({ children, index, total }) => {
    const title = total > 1 ? `Result ${index + 1}` : 'Result'
    return (
        <>
            <Title order={4}>{title}</Title>
            <Container>{children}</Container>
        </>
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

    if (item.count === null) {
        return (
            <ResultContainer index={index} total={total}>
                Success.
            </ResultContainer>
        )
    }

    if (item.columns === undefined) {
        return (
            <ResultContainer index={index} total={total}>
                {item.count || 'No'} affected{' '}
                {item.count === 1 ? 'row' : 'rows'}.
            </ResultContainer>
        )
    }

    return (
        <ResultContainer index={index} total={total}>
            {(item.columns !== undefined || item.count !== null) && (
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
            )}
            <div className={classes.flex}>
                {format === 'json' && <JsonResult {...item} />}
                {format === 'table' && <TableResult {...item} />}
            </div>
        </ResultContainer>
    )
}

export const Result: React.FC<{
    result?: GptSqlResultItem[]
}> = ({ result }) => {
    if (!result?.length) return null
    return (
        <Fragment>
            {result.map((item, tableKey) => (
                <ItemResult
                    key={tableKey}
                    index={tableKey}
                    total={result.length}
                    item={item}
                />
            ))}
        </Fragment>
    )
}
