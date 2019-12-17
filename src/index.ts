import { tableToTS } from './typescript'
import { Postgres } from './pg-client'
import prettier from 'prettier'
import pkg from '../package.json'

function pretty(code: string): string {
  return prettier.format(code, {
    parser: 'typescript',
    ...pkg.prettier
  })
}

export async function inferTable(connectionString: string, table: string): Promise<string> {
  const db = new Postgres(connectionString)
  const code = tableToTS(table, await db.table(table))
  return pretty(code)
}

export async function inferSchema(connectionString: string): Promise<string> {
  const db = new Postgres(connectionString)
  const tables = await db.allTables()
  const interfaces = tables.map(table => tableToTS(table.name, table.table))
  const code = interfaces.join('\n')
  return pretty(code)
}
