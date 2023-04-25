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

import { ResultItem, Result as ResultType } from '@/shared/result'
import { useStyles, getOptions } from '@/utils'

const options = getOptions()

const JsonResult: React.FC<{ item: ResultItem }> = ({ item }) => {
    const {
        classes: { code }
    } = useStyles()
    return (
        <Prism classNames={{ code }} language='json'>
            {JSON.stringify(item, null, 2)}
        </Prism>
    )
}

const TableResult: React.FC<{ item: ResultItem }> = ({ item }) => {
    const props: TableProps = {
        striped: true,
        highlightOnHover: true,
        withBorder: true,
        withColumnBorders: true
    }

    return (
        <Table {...props}>
            <thead>
                <tr>
                    {item.columns?.map((col, colKey) => (
                        <th key={colKey}>{col.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {item.rows.map((row, rowKey) => (
                    <tr key={rowKey}>
                        {item.columns?.map((col, colKey) => (
                            <td key={`${rowKey}-${colKey}`}>{row[col.name]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

const ResultContainer: React.FC<
    PropsWithChildren<{ index?: number; total?: number }>
> = ({ children, index, total }) => {
    const title =
        index !== undefined && total !== undefined && total > 1
            ? `Result ${index + 1}`
            : 'Result'
    return (
        <>
            <Title order={4}>{title}</Title>
            <Container>{children}</Container>
        </>
    )
}

const ItemResult: React.FC<{
    item: ResultItem
    index?: number
    total?: number
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
                        onChange={(v: (typeof options)['format']) =>
                            setFormat(v)
                        }
                        data={[
                            { label: 'Table', value: 'table' },
                            { label: 'JSON', value: 'json' }
                        ]}
                    />
                </Group>
            )}
            <div className={classes.flex}>
                {(format === 'json' && <JsonResult item={item} />) || (
                    <TableResult item={item} />
                )}
            </div>
        </ResultContainer>
    )
}

export const Result: React.FC<{
    result: ResultType
}> = ({ result }) => (
    <Fragment>
        {result.data.map((item, tableKey) => (
            <ItemResult
                key={tableKey}
                index={tableKey}
                total={result.data.length}
                item={item}
            />
        ))}
    </Fragment>
)
