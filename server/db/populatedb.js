const { Client } = require("pg")
require("dotenv").config()

const SQL = `
WITH seed(trip_date, income, notes) AS (
  VALUES
    ('2026-04-01'::date, 120.50::numeric, 'Airport run + short city dropoff'::text),
    ('2026-04-05'::date, 280.00::numeric, 'Weekend trips'::text),
    ('2026-04-12'::date, 75.25::numeric,  'Late night ride'::text),
    ('2026-04-18'::date, 430.00::numeric, 'Long-distance trip'::text)
),
max_id AS (
  SELECT COALESCE(MAX(id), 0) AS m FROM trips
),
numbered AS (
  SELECT ROW_NUMBER() OVER () AS rn, trip_date, income, notes
  FROM seed
)
INSERT INTO trips (id, trip_date, income, notes)
SELECT (max_id.m + numbered.rn)::bigint, numbered.trip_date, numbered.income, numbered.notes
FROM max_id, numbered;

WITH seed(exprense_date, category, amount, notes) AS (
  VALUES
    ('2026-04-02'::date, 'Fuel'::varchar, 45.20::numeric, 'Gas station'::text),
    ('2026-04-03'::date, 'Maintenance'::varchar, 120.00::numeric, 'Oil change'::text),
    ('2026-04-10'::date, 'Tolls'::varchar, 18.75::numeric, 'Highway tolls'::text),
    ('2026-04-15'::date, 'Parking'::varchar, 12.00::numeric, 'City parking'::text)
),
max_id AS (
  SELECT COALESCE(MAX(id), 0) AS m FROM expenses
),
numbered AS (
  SELECT ROW_NUMBER() OVER () AS rn, exprense_date, category, amount, notes
  FROM seed
)
INSERT INTO expenses (id, exprense_date, category, amount, notes)
SELECT (max_id.m + numbered.rn)::int, numbered.exprense_date, numbered.category, numbered.amount, numbered.notes
FROM max_id, numbered;
`

async function main() {
  console.log("seeding...")

  const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: Number(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  await client.query(SQL)
  await client.end()

  console.log("done")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})