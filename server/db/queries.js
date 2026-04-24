const pool = require("./pool")

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
    deleteExpense
}