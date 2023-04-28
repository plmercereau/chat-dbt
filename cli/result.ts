import { RowList, Row } from 'postgres'
import table from 'tty-table'

import { Result, ResultItem } from '@/shared/result'
import { ResultFormat } from '@/shared/options'

class CLIResultItem extends ResultItem {
    toTable(): string {
        if (this.columns) {
            // * Data is expected e.g. SELECT statement
            return table(
                this.columns.map(col => ({ value: col.name })),
                this.rows,
                { defaultValue: '' }
            ).render()
        } else {
            // * No data is expected e.g. INSERT statement with no RETURNING clause
            return table([{ value: 'count' }], [{ count: this.count }]).render()
        }
    }
}

export class CLIResult extends Result<CLIResultItem> {
    constructor(result: RowList<Row[]>) {
        super(result, CLIResultItem)
    }
    toTable(): string {
        return this.data.map(item => item.toTable()).join('\n')
    }
    toString(format?: ResultFormat): string {
        switch (format) {
            case 'table':
                return this.toTable()
            default:
                return super.toString(format)
        }
    }
}
