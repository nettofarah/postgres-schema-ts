import { Table } from './typescript'
import { mapValues } from 'lodash'
import { Enums } from './pg-client'

export function mapColumn(table: Table, enumTypes: Enums): Table {
  return mapValues(table, column => {
    switch (column.udtName) {
      case 'bpchar':
      case 'char':
      case 'varchar':
      case 'text':
      case 'citext':
      case 'uuid':
      case 'bytea':
      case 'inet':
      case 'time':
      case 'timetz':
      case 'interval':
      case 'name':
        column.tsType = 'string'
        return column
      case 'int2':
      case 'int4':
      case 'int8':
      case 'float4':
      case 'float8':
      case 'numeric':
      case 'money':
      case 'oid':
        column.tsType = 'number'
        return column
      case 'bool':
        column.tsType = 'boolean'
        return column
      case 'json':
      case 'jsonb':
        column.tsType = 'Object'
        return column
      case 'date':
      case 'timestamp':
      case 'timestamptz':
        column.tsType = 'Date'
        return column
      case '_int2':
      case '_int4':
      case '_int8':
      case '_float4':
      case '_float8':
      case '_numeric':
      case '_money':
        column.tsType = 'Array<number>'
        return column
      case '_bool':
        column.tsType = 'Array<boolean>'
        return column
      case '_varchar':
      case '_text':
      case '_citext':
      case '_uuid':
      case '_bytea':
        column.tsType = 'Array<string>'
        return column
      case '_json':
      case '_jsonb':
        column.tsType = 'Array<Object>'
        return column
      case '_timestamptz':
        column.tsType = 'Array<Date>'
        return column
      default: {
        const name = column.udtName
        const enumType: string[] | undefined = enumTypes[name]
        column.tsType = enumType?.map(s => `'${s}'`).join(' | ') || 'any'
        return column
      }
    }
  })
}
