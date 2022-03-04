import pg from 'pg-promise'
import { parse as urlParse } from 'url'
import { Table } from './typescript'
import { mapColumn } from './column-map'
import { SQLStatement } from 'sql-template-strings'

export type Enums = { [key: string]: string[] }

export class Postgres {
  private connection: pg.IDatabase<{}>
  private defaultSchema: string

  constructor(connectionString: string) {
    const pgp = pg()
    this.connection = pgp(connectionString)
    const database = (urlParse(connectionString, true).query['currentSchema'] as string) || 'public'
    this.defaultSchema = database
  }

  public async table(tableName: string): Promise<Table> {
    const enumTypes = await this.enums(tableName)
    const table = await this.getTable(tableName, this.schema())
    return mapColumn(table, enumTypes)
  }

  public async allTables(): Promise<{ name: string; table: Table }[]> {
    const names = await this.tableNames()
    const nameMapping = names.map(async name => ({
      name,
      table: await this.table(name)
    }))

    return Promise.all(nameMapping)
  }

  public async query<T>(query: SQLStatement): Promise<T> {
    return this.connection.query<T>(query.text, query.values)
  }

  private async tableNames(): Promise<string[]> {
    return this.connection.map<string>(
      `SELECT table_name FROM information_schema.columns WHERE table_schema = $1 GROUP BY table_name`,
      [this.schema()],
      (schemaItem: { table_name: string }) => {
        return schemaItem.table_name
      }
    )
  }

  public schema(): string {
    return this.defaultSchema
  }

  private async enums(_tableName: string): Promise<Enums> {
    type T = { name: string; value: any }
    const enums: Enums = {}

    await this.connection.each<T>(
      `SELECT n.nspname AS schema, t.typname AS name, e.enumlabel AS value
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = $1
        ORDER BY t.typname ASC, e.enumlabel ASC;`,
      [this.schema()],
      (item: T) => {
        if (!enums[item.name]) {
          enums[item.name] = []
        }
        enums[item.name].push(item.value)
      }
    )
    return enums
  }

  private async getTable(tableName: string, tableSchema: string): Promise<Table> {
    const tableDefinition: Table = {}
    type T = { column_name: string; udt_name: string; is_nullable: string }

    await this.connection.each<T>(
      `SELECT column_name, udt_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1 and table_schema = $2`,
      [tableName, tableSchema],
      (schemaItem: T) => {
        tableDefinition[schemaItem.column_name] = {
          udtName: schemaItem.udt_name,
          nullable: schemaItem.is_nullable === 'YES'
        }
      }
    )

    return tableDefinition
  }
}
