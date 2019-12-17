# postgres-schema-ts

> postgres-schema-ts is a simple npm module you can use to convert a mysql schema into typescript interfaces

# Usage

```bash
# to infer an entire schema
$ npx postgres-schema-ts mysql://root@localhost:3306/database

# to infer a specific table
$ npx postgres-schema-ts mysql://root@localhost:3306/database table_name
```

tip: You can pipe the output of postgres-schema-ts into a file with `npx postgres-schema-ts <args> > schema.ts`

## Demo

For the following SQL schema: (from the musicbrainz database)

```sql
CREATE TABLE IF NOT EXISTS artist ( -- replicate (verbose)
    id                  SERIAL,
    gid                 CHAR(36) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    sort_name           VARCHAR(255) NOT NULL,
    begin_date_year     SMALLINT,
    begin_date_month    SMALLINT,
    begin_date_day      SMALLINT,
    end_date_year       SMALLINT,
    end_date_month      SMALLINT,
    end_date_day        SMALLINT,
    type                INTEGER, -- references artist_type.id
    area                INTEGER, -- references area.id
    gender              INTEGER, -- references gender.id
    comment             VARCHAR(255) NOT NULL DEFAULT '',
    edits_pending       INTEGER NOT NULL DEFAULT 0 CHECK (edits_pending >= 0),
    last_updated        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ended               CHAR(1) NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS track ( -- replicate (verbose)
    id                  SERIAL,
    gid                 CHAR(36) NOT NULL,
    recording           INTEGER NOT NULL, -- references recording.id
    medium              INTEGER NOT NULL, -- references medium.id
    position            INTEGER NOT NULL,
    number              TEXT NOT NULL,
    name                VARCHAR(255) NOT NULL,
    artist_credit       INTEGER NOT NULL, -- references artist_credit.id
    length              INTEGER CHECK (length IS NULL OR length > 0),
    edits_pending       INTEGER NOT NULL DEFAULT 0 CHECK (edits_pending >= 0),
    last_updated        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_data_track       CHAR(1) NOT NULL DEFAULT FALSE
) CHARACTER SET utf8 COLLATE utf8_general_ci;
```

run:

```bash
$ npx postgres-schema-ts mysql://root@localhost:3306/musicbrainz
```

```typescript
export interface artist {
  id: number
  gid: string
  name: string
  sort_name: string
  begin_date_year: number | null
  begin_date_month: number | null
  begin_date_day: number | null
  end_date_year: number | null
  end_date_month: number | null
  end_date_day: number | null
  type: number | null
  area: number | null
  gender: number | null
  comment: string
  edits_pending: number
  last_updated: Date
  ended: string
}
export interface track {
  id: number
  gid: string
  recording: number
  medium: number
  position: number
  number_: string
  name: string
  artist_credit: number
  length: number | null
  edits_pending: number
  last_updated: Date
  is_data_track: string
}
```

## Using `postgres-schema-ts` programatically

```typescript
import { inferSchema, inferTable } from 'postgres-schema-ts'

await inferSchema(connectionString)
await inferTable(connectionString, tableName)
```

## Design

postgres-schema-ts is inpired by the awesome [schemats](https://github.com/SweetIQ/schemats) library.
But takes a simpler, more blunt, and configuration free approach:

- Simpler defaults
- MySQL support only
- Inline enums
- No support for namespaces

## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
