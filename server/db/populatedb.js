const {Client} = require("pg")

const SQL = ` CREATE TABLE IF NOT EXISTS trips(
id INTEGER PRIMARY KEY,
trip_date DATE NOT NULL,
income NUMERIC(14,2) NOT NULL,
notes TEXT
);

CREATE TABLE IF NOT EXISTS expenses(
id INTEGER PRIMARY KEY,
exprense_date DATE NOT NULL,
category VARCHAR(100),
amount NUMERIC(14,2) NOT NULL,
notes TEXT
);
 `

 async function main(){
     console.log("seeding...")
     const client = new Client({
         connectionString: "postgresql://postgres:JSGhqi8jBqubHG-@db.snogtuetsolyxwpqqsmb.supabase.co:5432/postgres"
     })
     await client.connect()
     await client.query(SQL)
     await client.end()
     console.log("done")
 
 }
 main()