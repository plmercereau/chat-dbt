import { stringify } from 'csv-stringify/sync'
import { ResultFormat } from './options'
import { ColumnList, RawSqlResult, Row } from './types'

type JSON = string | number | boolean | null | JSONObject | JSONArray
type JSONObject = { [key: string]: JSON }
type JSONArray = JSON[]

export class ResultItem {
    public rows: RawSqlResult
    public columns?: ColumnList
    public count: number | null
    constructor(row: RawSqlResult | Row) {
        this.rows = row as RawSqlResult
        this.columns = row.columns
        this.count = row.count
    }
    isEmpty(): boolean {
        return this.count === undefined
    }
    toCSV(): string {
        return stringify(this.toJSON(), { header: true })
    }

    toJSON(): JSONArray {
        return this.columns
            ? this.rows
            : this.count === null
            ? [{ success: true }]
            : [{ count: this.count }]
    }
}

export class Result<T extends ResultItem = ResultItem> {
    readonly data: Array<T>
    private rawData: RawSqlResult

    constructor(
        rawResult: RawSqlResult,
        ItemClass: new (
            ...args: ConstructorParameters<typeof ResultItem>
        ) => T = ResultItem as any
    ) {
        if (typeof rawResult !== 'object') {
            console.warn('???', rawResult)
        }
        if ('rows' in rawResult) {
            // * deserialize
            this.rawData = rawResult.rows as RawSqlResult
            this.rawData.columns = rawResult.columns
            this.rawData.count = rawResult.count
        } else {
            this.rawData = rawResult
        }
        if (this.rawData.columns || this.rawData.length === 0) {
            this.data = [new ItemClass(this.rawData)]
        } else {
            this.data = this.rawData.map(item => new ItemClass(item))
        }
    }

    toCSV(): string {
        return this.data.map(item => item.toCSV()).join('\n')
    }

    toJSON(): JSONArray {
        const result = this.data.map(item => item.toJSON())
        if (result.length === 1) {
            return result[0]
        }
        return result
    }

    toString(format?: Exclude<ResultFormat, 'table'>): string {
        switch (format) {
            case 'json':
                return JSON.stringify(this.toJSON())
            case 'csv':
                return this.toCSV()
            default:
                return this.data.toString()
        }
    }

    serialize() {
        return {
            columns: this.rawData.columns,
            count: this.rawData.count,
            rows: this.rawData
        }
    }
}
