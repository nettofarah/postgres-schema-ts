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
      "export interface account {
        username: string
        password: string
        email: string
        created_on: Date
        last_login: Date | null
      }
      "
    `)
  })

  it('works with enums', async () => {
    const code = await inferTable(connectionString, 'requests')
    expect(code).toMatchInlineSnapshot(`
      "export interface requests {
        name: string
        url: string
        integration_type: 'destination' | 'source'
      }
      "
    `)
  })

  it('works with complex types', async () => {
    const code = await inferTable(connectionString, 'complex')
    expect(code).toMatchInlineSnapshot(`
      "export interface complex {
        id: Object
        name: string
        nullable: string | null
        created_at: Date | null
        created_on: Date
      }
      "
    `)
  })
})

describe('inferSchema', () => {
  it('infers all tables at once', async () => {
    const code = await inferSchema(connectionString)
    expect(code).toMatchInlineSnapshot(`
      "export interface account {
        username: string
        password: string
        email: string
        created_on: Date
        last_login: Date | null
      }
      export interface complex {
        id: Object
        name: string
        nullable: string | null
        created_at: Date | null
        created_on: Date
      }
      export interface requests {
        name: string
        url: string
        integration_type: 'destination' | 'source'
      }
      "
    `)
  })
})
