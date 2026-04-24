const express = require("express")
require("dotenv").config()
const cors = require("cors")
const ExcelJS = require("exceljs")
const app = express()
const {
    createTrip,
    findAllTrips,
    updateTrip,
    deleteTrip,
    getDailyReport,
    findAllExpenses,
    findExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
} = require("./db/queries")

const PORT = process.env.PORT

const allowedOrigins = [
    "https://compta.bysolitdio.com",
    "https://api-compta.bysolitdio.com",
    "http://localhost:5173",
    "http://localhost:5174",
]

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            if (allowedOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`CORS blocked for origin: ${origin}`))
        },
    })
)
app.use(express.json())

// Auth hook (future): add session/JWT middleware here and then protect the /api routes below.
// Example pattern: app.use(authMiddleware) or per-route middleware (app.get(..., requireAuth, handler)).

app.post("/api/trips", async (req, res) => {
    try {
        const { trip_date, income, notes } = req.body
        const newTrip = await createTrip(trip_date, income, notes)
        res.status(201).json(newTrip)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to create trip" })
    }
})

// Trips: list + optional date filtering via ?from=YYYY-MM-DD&to=YYYY-MM-DD
app.get("/api/trips", async (req, res) => {
    try {
        const from = typeof req.query.from === "string" ? req.query.from : undefined
        const to = typeof req.query.to === "string" ? req.query.to : undefined
        const trips = await findAllTrips(from, to)
        res.json(trips)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch trips" })
    }
})

app.put("/api/trips/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { trip_date, income, notes } = req.body
        const updated = await updateTrip(id, trip_date, income, notes)
        if (!updated) {
            return res.status(404).json({ error: "Trip not found" })
        }
        res.json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update trip" })
    }
})

app.delete("/api/trips/:id", async (req, res) => {
    try {
        const deleted = await deleteTrip(Number(req.params.id))
        if (!deleted) {
            return res.status(404).json({ error: "Trip not found" })
        }
        res.json(deleted)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to delete trip" })
    }
})

app.get("/api/reports/daily", async (req, res) => {
    try {
        // Reports: month-level daily aggregation (income vs expenses) with net.
        const month = typeof req.query.month === "string" ? req.query.month : ""

        const now = new Date()
        const year = month ? Number(month.split("-")[0]) : now.getFullYear()
        const m = month ? Number(month.split("-")[1]) : now.getMonth() + 1

        if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) {
            return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" })
        }

        const from = `${year}-${String(m).padStart(2, "0")}-01`
        const to = new Date(year, m, 0)
        const toStr = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(to.getDate()).padStart(2, "0")}`

        const rows = await getDailyReport(from, toStr)
        res.json({ from, to: toStr, days: rows })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to generate report" })
    }
})

app.get("/api/reports/daily.xlsx", async (req, res) => {
    try {
        // Excel export: same report as /api/reports/daily but returned as an .xlsx attachment.
        const month = typeof req.query.month === "string" ? req.query.month : ""
        const lang = typeof req.query.lang === "string" ? req.query.lang : "en"

        const now = new Date()
        const year = month ? Number(month.split("-")[0]) : now.getFullYear()
        const m = month ? Number(month.split("-")[1]) : now.getMonth() + 1

        if (!Number.isFinite(year) || !Number.isFinite(m) || m < 1 || m > 12) {
            return res.status(400).json({ error: "Invalid month format. Use YYYY-MM" })
        }

        const from = `${year}-${String(m).padStart(2, "0")}-01`
        const to = new Date(year, m, 0)
        const toStr = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(to.getDate()).padStart(2, "0")}`

        const rows = await getDailyReport(from, toStr)

        const wb = new ExcelJS.Workbook()
        wb.creator = "Compta"
        wb.created = new Date()

        const title = lang === "fr" ? "Rapport quotidien" : "Daily Report"
        const ws = wb.addWorksheet(title)
        const headers = lang === "fr"
            ? { day: "Date", income: "Revenu", expenses: "Dépenses", net: "Net" }
            : { day: "Date", income: "Income", expenses: "Expenses", net: "Net" }

        ws.columns = [
            { header: headers.day, key: "day", width: 14 },
            { header: headers.income, key: "income_total", width: 14 },
            { header: headers.expenses, key: "expense_total", width: 14 },
            { header: headers.net, key: "net", width: 14 },
        ]

        ws.getRow(1).font = { bold: true }

        for (const r of rows) {
            const dayVal = r.day instanceof Date ? r.day : new Date(String(r.day))
            ws.addRow({
                day: dayVal,
                income_total: Number(r.income_total ?? 0),
                expense_total: Number(r.expense_total ?? 0),
                net: Number(r.net ?? 0),
            })
        }

        ws.getColumn("day").numFmt = lang === "fr" ? "dd/mm/yyyy" : "mm/dd/yyyy"
        ws.getColumn("income_total").numFmt = "#,##0.00"
        ws.getColumn("expense_total").numFmt = "#,##0.00"
        ws.getColumn("net").numFmt = "#,##0.00"

        const fileMonth = `${year}-${String(m).padStart(2, "0")}`
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition", `attachment; filename=monthly-report-${fileMonth}.xlsx`)

        await wb.xlsx.write(res)
        res.end()
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to generate excel report" })
    }
})

app.get("/api/expenses", async (req, res) => {
    try {
        const from = typeof req.query.from === "string" ? req.query.from : undefined
        const to = typeof req.query.to === "string" ? req.query.to : undefined
        const expenses = await findAllExpenses(from, to)
        res.json(expenses)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch expenses" })
    }
})

app.get("/api/expenses/:id", async (req, res) => {
    try {
        const expense = await findExpenseById(Number(req.params.id))
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" })
        }
        res.json(expense)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to fetch expense" })
    }
})

app.post("/api/expenses", async (req, res) => {
    try {
        const { expense_date, category, amount, notes } = req.body
        const newExpense = await createExpense(expense_date, category ?? null, amount, notes ?? null)
        res.status(201).json(newExpense)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to create expense" })
    }
})

app.put("/api/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { expense_date, category, amount, notes } = req.body
        const updated = await updateExpense(id, expense_date, category ?? null, amount, notes ?? null)
        if (!updated) {
            return res.status(404).json({ error: "Expense not found" })
        }
        res.json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update expense" })
    }
})

app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const deleted = await deleteExpense(Number(req.params.id))
        if (!deleted) {
            return res.status(404).json({ error: "Expense not found" })
        }
        res.json(deleted)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to delete expense" })
    }
})

app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`)
})