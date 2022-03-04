import { camelCase } from './camelcase'

export interface Column {
  udtName: string
  nullable: boolean
  tsType?: string
}

export interface Table {
  [columnName: string]: Column
}

// function normalize(name: string): string {
//   const reservedKeywords = ['string', 'number', 'package']
//   if (reservedKeywords.includes(name)) {
//     return name + '_'
//   } else {
//     return name
//   }
// }

const typeColumnName = (tableName: string, columnName: string) => {
  return `${tableName}${camelCase(columnName, { pascalCase: true })}`
}

export function tableToTS(name: string, table: Table): string {
  const tableName = camelCase(name, { pascalCase: true }) + 'Table'

  const fields = Object.keys(table).map(column => {
    const type = table[column].tsType
    const nullable = table[column].nullable ? ' | null' : ''
    return `export type ${typeColumnName(tableName, column)} = ${type}${nullable};\n`
  })

  const members = Object.keys(table).map(column => {
    return `${column}: ${typeColumnName(tableName, column)}\n`
  })

  const columnNames = Object.keys(table).map(column => {
    return `${column}: "${column}",\n`
  })

  return `
    ${fields.join('')}
    export type ${tableName} = {
      ${members.join('')}
    }\n
    export const ${tableName}Name = "${name}";\n
    export const ${tableName}ColumnNames = {
      ${columnNames.join('')}
    }\n
  `
}
