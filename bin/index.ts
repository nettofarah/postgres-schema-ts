import { inferSchema, inferTable } from '../src'

const [...args] = process.argv

async function main(): Promise<string> {
  const db = args[2] || ''
  const table = args[3]

  if (table) {
    return inferTable(db, table)
  }

  return inferSchema(db)
}

main()
  .then(code => {
    console.log(code)
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
