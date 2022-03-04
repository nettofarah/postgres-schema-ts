import { Postgres } from '../src/pg-client'
import { inferTable, inferSchema } from '../src'
import { SQL as sql } from 'sql-template-strings'

const connectionString = 'postgresql://postgres:password@localhost:5433/db?currentSchema=public'
const pg = new Postgres(connectionString)

const account = sql`
  DROP TABLE IF EXISTS account;
  CREATE TABLE account (
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (50) NOT NULL,
    email VARCHAR (355) UNIQUE NOT NULL,
    created_on TIMESTAMP NOT NULL,
    last_login TIMESTAMP
  )
`

const requests = sql`
  DROP TYPE IF EXISTS integration_type_enum CASCADE;
  CREATE TYPE integration_type_enum AS ENUM (
      'source',
      'destination'
  );

  DROP TABLE IF EXISTS requests;
  CREATE TABLE requests (
    name varchar(255) NOT NULL,
    url varchar(255) NOT NULL,
    integration_type integration_type_enum NOT NULL
  );
`

const complex = sql`
  DROP TABLE IF EXISTS complex;
  CREATE TABLE complex (
    id json NOT NULL,
    name varchar(255) NOT NULL,
    nullable varchar(255),
    created_at timestamp,
    created_on date NOT NULL
  )
`

beforeAll(async () => {
  await pg.query(account)
  await pg.query(requests)
  await pg.query(complex)
})

describe('inferTable', () => {
  it('infers a table', async () => {
    const code = await inferTable(connectionString, 'account')
    expect(code).toMatchInlineSnapshot(`
      "export type AccountTableUsername = string
      export type AccountTablePassword = string
      export type AccountTableEmail = string
      export type AccountTableCreatedOn = Date
      export type AccountTableLastLogin = Date | null

      export type AccountTable = {
        username: AccountTableUsername
        password: AccountTablePassword
        email: AccountTableEmail
        created_on: AccountTableCreatedOn
        last_login: AccountTableLastLogin
      }

      export const AccountTableName = \\"account\\"

      export const AccountTableColumnNames = {
        username: \\"username\\",
        password: \\"password\\",
        email: \\"email\\",
        created_on: \\"created_on\\",
        last_login: \\"last_login\\"
      }
      "
    `)
  })

  it('works with enums', async () => {
    const code = await inferTable(connectionString, 'requests')
    expect(code).toMatchInlineSnapshot(`
      "export type RequestsTableName = string
      export type RequestsTableUrl = string
      export type RequestsTableIntegrationType = \\"destination\\" | \\"source\\"

      export type RequestsTable = {
        name: RequestsTableName
        url: RequestsTableUrl
        integration_type: RequestsTableIntegrationType
      }

      export const RequestsTableName = \\"requests\\"

      export const RequestsTableColumnNames = {
        name: \\"name\\",
        url: \\"url\\",
        integration_type: \\"integration_type\\"
      }
      "
    `)
  })

  it('works with complex types', async () => {
    const code = await inferTable(connectionString, 'complex')
    expect(code).toMatchInlineSnapshot(`
      "export type JSONPrimitive = string | number | boolean | null
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray
      export type JSONObject = { [member: string]: JSONValue }
      export type JSONArray = Array<JSONValue>

      export type ComplexTableId = JSONValue
      export type ComplexTableName = string
      export type ComplexTableNullable = string | null
      export type ComplexTableCreatedAt = Date | null
      export type ComplexTableCreatedOn = Date

      export type ComplexTable = {
        id: ComplexTableId
        name: ComplexTableName
        nullable: ComplexTableNullable
        created_at: ComplexTableCreatedAt
        created_on: ComplexTableCreatedOn
      }

      export const ComplexTableName = \\"complex\\"

      export const ComplexTableColumnNames = {
        id: \\"id\\",
        name: \\"name\\",
        nullable: \\"nullable\\",
        created_at: \\"created_at\\",
        created_on: \\"created_on\\"
      }
      "
    `)
  })
})

describe('inferSchema', () => {
  it('infers all tables at once', async () => {
    const code = await inferSchema(connectionString)
    expect(code).toMatchInlineSnapshot(`
      "export type JSONPrimitive = string | number | boolean | null
      export type JSONValue = JSONPrimitive | JSONObject | JSONArray
      export type JSONObject = { [member: string]: JSONValue }
      export type JSONArray = Array<JSONValue>

      export type AccountTableUsername = string
      export type AccountTablePassword = string
      export type AccountTableEmail = string
      export type AccountTableCreatedOn = Date
      export type AccountTableLastLogin = Date | null

      export type AccountTable = {
        username: AccountTableUsername
        password: AccountTablePassword
        email: AccountTableEmail
        created_on: AccountTableCreatedOn
        last_login: AccountTableLastLogin
      }

      export const AccountTableName = \\"account\\"

      export const AccountTableColumnNames = {
        username: \\"username\\",
        password: \\"password\\",
        email: \\"email\\",
        created_on: \\"created_on\\",
        last_login: \\"last_login\\"
      }

      export type ComplexTableId = JSONValue
      export type ComplexTableName = string
      export type ComplexTableNullable = string | null
      export type ComplexTableCreatedAt = Date | null
      export type ComplexTableCreatedOn = Date

      export type ComplexTable = {
        id: ComplexTableId
        name: ComplexTableName
        nullable: ComplexTableNullable
        created_at: ComplexTableCreatedAt
        created_on: ComplexTableCreatedOn
      }

      export const ComplexTableName = \\"complex\\"

      export const ComplexTableColumnNames = {
        id: \\"id\\",
        name: \\"name\\",
        nullable: \\"nullable\\",
        created_at: \\"created_at\\",
        created_on: \\"created_on\\"
      }

      export type RequestsTableName = string
      export type RequestsTableUrl = string
      export type RequestsTableIntegrationType = \\"destination\\" | \\"source\\"

      export type RequestsTable = {
        name: RequestsTableName
        url: RequestsTableUrl
        integration_type: RequestsTableIntegrationType
      }

      export const RequestsTableName = \\"requests\\"

      export const RequestsTableColumnNames = {
        name: \\"name\\",
        url: \\"url\\",
        integration_type: \\"integration_type\\"
      }
      "
    `)
  })
})
