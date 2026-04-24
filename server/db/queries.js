const pool = require("./pool")

// Note: these queries are intentionally simple.
// Auth hook (future): if you add users, you will likely add a user_id column and filter in these queries.

async function findAllTrips(fromDate, toDate){
    if (fromDate && toDate) {
        const { rows } = await pool.query(
            `SELECT * FROM trips WHERE trip_date::date BETWEEN $1 AND $2 ORDER BY trip_date DESC, id DESC`,
            [fromDate, toDate]
        )
        return rows
    }

    const {rows} = await pool.query(`SELECT * FROM trips ORDER BY trip_date DESC, id DESC`)
    return rows
}

async function findAllExpenses(fromDate, toDate){
    if (fromDate && toDate) {
        const { rows } = await pool.query(
            `SELECT id, exprense_date AS expense_date, category, amount, notes
             FROM expenses
             WHERE exprense_date::date BETWEEN $1 AND $2
             ORDER BY exprense_date DESC, id DESC`,
            [fromDate, toDate]
        )
        return rows
    }

    const { rows } = await pool.query(
        `SELECT id, exprense_date AS expense_date, category, amount, notes FROM expenses ORDER BY exprense_date DESC, id DESC`
    )
    return rows
}

async function findExpenseById(id){
    const { rows } = await pool.query(`SELECT id, exprense_date AS expense_date, category, amount, notes FROM expenses WHERE id = $1`, [id])
    return rows[0]
}

async function createTrip(trip_date, income, notes){
    // Some DB schemas may have trips.id as NOT NULL without SERIAL/IDENTITY.
    // This uses MAX(id)+1 to generate ids without altering the table structure.
    const { rows } = await pool.query(
        `WITH next_id AS (
            SELECT COALESCE(MAX(id), 0) + 1 AS id FROM trips
         )
         INSERT INTO trips (id, trip_date, income, notes)
         SELECT next_id.id, $1, $2, $3
         FROM next_id
         RETURNING *`,
        [trip_date, income, notes]
    )
    return rows[0]
}

async function updateTrip(id, trip_date, income, notes){
    const { rows } = await pool.query(
        `UPDATE trips
         SET trip_date = $2,
             income = $3,
             notes = $4
         WHERE id = $1
         RETURNING *`,
        [id, trip_date, income, notes]
    )
    return rows[0]
}

async function deleteTrip(id){
    const { rows } = await pool.query(
        `DELETE FROM trips WHERE id = $1 RETURNING *`,
        [id]
    )
    return rows[0]
}

async function getDailyReport(fromDate, toDate){
    const { rows } = await pool.query(
        `WITH trip_daily AS (
            SELECT trip_date::date AS day, SUM(income)::numeric AS income_total
            FROM trips
            WHERE trip_date::date BETWEEN $1 AND $2
            GROUP BY trip_date::date
        ),
        expense_daily AS (
            SELECT exprense_date::date AS day, SUM(amount)::numeric AS expense_total
            FROM expenses
            WHERE exprense_date::date BETWEEN $1 AND $2
            GROUP BY exprense_date::date
        )
        SELECT
            COALESCE(t.day, e.day) AS day,
            COALESCE(t.income_total, 0)::numeric AS income_total,
            COALESCE(e.expense_total, 0)::numeric AS expense_total,
            (COALESCE(t.income_total, 0) - COALESCE(e.expense_total, 0))::numeric AS net
        FROM trip_daily t
        FULL OUTER JOIN expense_daily e
            ON e.day = t.day
        ORDER BY day DESC`,
        [fromDate, toDate]
    )
    return rows
}

async function createExpense(expense_date, category, amount, notes){
    // Same MAX(id)+1 strategy as trips, for schemas where expenses.id has no default.
    const { rows } = await pool.query(
        `WITH next_id AS (
            SELECT COALESCE(MAX(id), 0) + 1 AS id FROM expenses
         )
         INSERT INTO expenses (id, exprense_date, category, amount, notes)
         SELECT next_id.id, $1, $2, $3, $4
         FROM next_id
         RETURNING *`,
        [expense_date, category, amount, notes]
    )
    return rows[0]
}

async function updateExpense(id, expense_date, category, amount, notes){
    const { rows } = await pool.query(
        `UPDATE expenses
         SET exprense_date = $2,
             category = $3,
             amount = $4,
             notes = $5
         WHERE id = $1
         RETURNING *`,
        [id, expense_date, category, amount, notes]
    )
    return rows[0]
}

async function deleteExpense(id){
    const { rows } = await pool.query(
        `DELETE FROM expenses WHERE id = $1 RETURNING *`,
        [id]
    )
    return rows[0]
}

async function findUserByUsername(username){
    const { rows } = await pool.query(
        `SELECT id, username, password_hash, is_admin FROM conta_users WHERE username = $1`,
        [username]
    )
    return rows[0]
}

async function findUserById(id){
    const { rows } = await pool.query(
        `SELECT id, username, password_hash, is_admin FROM conta_users WHERE id = $1`,
        [id]
    )
    return rows[0]
}

async function createUser(username, passwordHash){
    const { rows } = await pool.query(
        `INSERT INTO conta_users (username, password_hash, is_admin)
         VALUES ($1, $2, false)
         RETURNING id, username, is_admin`,
        [username, passwordHash]
    )
    return rows[0]
}

module.exports={
    findAllTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getDailyReport,
    findAllExpenses,
    findExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    findUserByUsername,
    findUserById,
    createUser
}