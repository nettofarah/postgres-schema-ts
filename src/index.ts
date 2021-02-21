import { tableToTS } from './typescript'
import { Postgres } from './pg-client'
import prettier from 'prettier'
import pkg from '../package.json'

const JSONHeader = `
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

`

const header = (includesJSON: boolean): string => (includesJSON ? JSONHeader : '')

function pretty(code: string): string {
  return prettier.format(code, {
    parser: 'typescript',
    ...pkg.prettier
  })
}

export async function inferTable(connectionString: string, table: string): Promise<string> {
  const db = new Postgres(connectionString)
  const code = tableToTS(table, await db.table(table))
  const fullCode = `
    ${header(code.includes('JSONValue'))}
    ${code}
  `
  const result = pretty(fullCode)
  db.disconnect()
  return result
}

export async function inferSchema(connectionString: string): Promise<string> {
  const db = new Postgres(connectionString)
  const tables = await db.allTables()
  const interfaces = tables.map(table => tableToTS(table.name, table.table))
  const code = [header(interfaces.some(i => i.includes('JSONValue'))), ...interfaces].join('\n')
  const result = pretty(code)
  db.disconnect()
  return result
}
