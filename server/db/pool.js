const {Pool} = require("pg")
require("dotenv").config()

const ssl =
    String(process.env.DB_SSL ?? "true").trim().toLowerCase() === "false"
        ? false
        : { rejectUnauthorized: false }

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    port: Number(process.env.DB_PORT),
    ssl,
})

module.exports = pool
