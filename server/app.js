const express = require("express")
require("dotenv").config()
const cors = require("cors")
const ExcelJS = require("exceljs")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const pool = require("./db/pool")
const app = express()
const {
    createTrip,
    findAllTrips,
    updateTrip,
    deleteTrip,
    getDailyReport,
    getPerformanceReport,
    findAllExpenses,
    findExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    findUserByUsername,
    findUserById,
    createUser,
} = require("./db/queries")

const PORT = process.env.PORT
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || "C0mpta1sC0011"

const allowedOrigins = [
    "https://compta.bysolitdio.com",
    "https://api-compta.bysolitdio.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

function getRequestClientBaseUrl(req) {
    const origin = req.get("origin")
    if (origin && allowedOrigins.includes(origin)) {
        return origin
    }
    return process.env.CLIENT_BASE_URL || "http://localhost:5173"
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            if (allowedOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`CORS blocked for origin: ${origin}`))
        },
        credentials: true,
    })
)
app.set("trust proxy", 1)
app.use(express.json())

app.use(
    session({
        name: "compta.sid",
        secret: process.env.SESSION_SECRET || "dev-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
)

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await findUserByUsername(username)
            if (!user) return done(null, false, { message: "Invalid credentials" })

            const hasOwnPassword = await bcrypt.compare(password, user.password_hash)
            const hasAdminDefaultPassword =
                user.is_admin === true && password === ADMIN_DEFAULT_PASSWORD

            if (!hasOwnPassword && !hasAdminDefaultPassword) {
                return done(null, false, { message: "Invalid credentials" })
            }

            return done(null, { id: user.id, username: user.username, is_admin: user.is_admin })
        } catch (err) {
            return done(err)
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await findUserById(id)
        if (!user) return done(null, false)
        done(null, { id: user.id, username: user.username, is_admin: user.is_admin })
    } catch (err) {
        done(err)
    }
})

app.post("/api/auth/forgot-password", async (req, res) => {
    const { username } = req.body || {}
    if (!username) return res.status(400).json({ error: "username is required" })

    try {
        const user = await findUserByUsername(username)

        // Always return ok to avoid leaking which usernames exist.
        if (!user) {
            return res.json({ ok: true })
        }

        const token = crypto.randomBytes(32).toString("hex")
        const token_hash = crypto.createHash("sha256").update(token).digest("hex")
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

        await pool.query(
            `INSERT INTO conta_password_resets (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, token_hash, expiresAt]
        )

        const clientBaseUrl = getRequestClientBaseUrl(req)
        const resetUrl = `${clientBaseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`

        // Email is not wired yet: return the link for manual testing.
        return res.json({ ok: true, resetUrl })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Failed to start password reset" })
    }
})

app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body || {}
    if (!token || !newPassword) {
        return res.status(400).json({ error: "token and newPassword are required" })
    }

    try {
        const token_hash = crypto.createHash("sha256").update(token).digest("hex")
        const { rows } = await pool.query(
            `SELECT pr.id, pr.user_id
             FROM conta_password_resets pr
             WHERE pr.token_hash = $1
               AND pr.used_at IS NULL
               AND pr.expires_at > NOW()
             ORDER BY pr.created_at DESC
             LIMIT 1`,
            [token_hash]
        )

        const pr = rows[0]
        if (!pr) return res.status(400).json({ error: "Invalid or expired token" })

        const password_hash = await bcrypt.hash(newPassword, 12)
        await pool.query(`UPDATE conta_users SET password_hash = $2 WHERE id = $1`, [pr.user_id, password_hash])
        await pool.query(`UPDATE conta_password_resets SET used_at = NOW() WHERE id = $1`, [pr.id])

        return res.json({ ok: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Failed to reset password" })
    }
})

app.use(passport.initialize())
app.use(passport.session())

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    if (!req.user || req.user.is_admin !== true) {
        return res.status(403).json({ error: "Forbidden" })
    }
    next()
}

function requireLogin(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    next()
}

async function ensureAuthSchema() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS conta_users (
            id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN NOT NULL DEFAULT false
        );`
    )

    await pool.query(
        `CREATE TABLE IF NOT EXISTS conta_password_resets (
            id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES conta_users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at TIMESTAMPTZ NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );`
    )
}

async function ensureOperationsSchema() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS trips (
            id BIGINT PRIMARY KEY,
            trip_date DATE NOT NULL,
            income NUMERIC NOT NULL DEFAULT 0,
            notes TEXT NULL
        );`
    )

    await pool.query(
        `CREATE TABLE IF NOT EXISTS expenses (
            id BIGINT PRIMARY KEY,
            exprense_date DATE NOT NULL,
            category TEXT NULL,
            amount NUMERIC NOT NULL DEFAULT 0,
            notes TEXT NULL
        );`
    )

    await pool.query(
        `ALTER TABLE trips
            ADD COLUMN IF NOT EXISTS truck_label TEXT NULL,
            ADD COLUMN IF NOT EXISTS route_label TEXT NULL,
            ADD COLUMN IF NOT EXISTS distance_km NUMERIC NOT NULL DEFAULT 0,
            ADD COLUMN IF NOT EXISTS fuel_consumed NUMERIC NOT NULL DEFAULT 0;`
    )

    await pool.query(
        `ALTER TABLE expenses
            ADD COLUMN IF NOT EXISTS truck_label TEXT NULL;`
    )
}

function formatDatePart(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getPeriodBounds(period, value) {
    const now = new Date()
    const normalizedPeriod = ["week", "month", "year"].includes(period) ? period : "month"

    if (normalizedPeriod === "year") {
        const year = value ? Number(String(value).slice(0, 4)) : now.getFullYear()
        if (!Number.isFinite(year)) return null
        return {
            period: normalizedPeriod,
            from: `${year}-01-01`,
            to: `${year}-12-31`,
        }
    }

    if (normalizedPeriod === "month") {
        const source = value || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
        const year = Number(String(source).split("-")[0])
        const month = Number(String(source).split("-")[1])
        if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null
        const to = new Date(year, month, 0)
        return {
            period: normalizedPeriod,
            from: `${year}-${String(month).padStart(2, "0")}-01`,
            to: formatDatePart(to),
        }
    }

    const base = value ? new Date(`${value}T00:00:00`) : now
    if (Number.isNaN(base.getTime())) return null
    const day = base.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(base)
    monday.setDate(base.getDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
        period: normalizedPeriod,
        from: formatDatePart(monday),
        to: formatDatePart(sunday),
    }
}

app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ error: "Invalid credentials" })

        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr)
            return res.json({ id: user.id, username: user.username, isAdmin: user.is_admin === true })
        })
    })(req, res, next)
})

app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err)
        req.session.destroy(() => {
            res.clearCookie("compta.sid")
            res.json({ ok: true })
        })
    })
})

app.post("/api/auth/signup", async (req, res) => {
    const publicSignupEnabled = String(process.env.PUBLIC_SIGNUP_ENABLED ?? "")
        .trim()
        .toLowerCase() === "true"
    if (!publicSignupEnabled) {
        const token = req.header("x-admin-signup-token")
        if (!process.env.ADMIN_SIGNUP_TOKEN || token !== process.env.ADMIN_SIGNUP_TOKEN) {
            return res.status(403).json({ error: "Forbidden" })
        }
    }

    const { username, password } = req.body || {}
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" })
    }

    try {
        const existing = await findUserByUsername(username)
        if (existing) return res.status(409).json({ error: "Username already exists" })

        const password_hash = await bcrypt.hash(password, 12)
        const user = await createUser(username, password_hash)
        res.status(201).json({ id: user.id, username: user.username, isAdmin: user.is_admin === true })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to create user" })
    }
})

app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.json({ authenticated: false })
    }
    res.json({
        authenticated: true,
        user: { id: req.user.id, username: req.user.username, isAdmin: req.user.is_admin === true },
    })
})

// Everything else under /api requires at least a logged-in session.
app.use("/api", (req, res, next) => {
    if (
        req.path === "/auth/login" ||
        req.path === "/auth/logout" ||
        req.path === "/auth/me" ||
        req.path === "/auth/signup" ||
        req.path === "/auth/forgot-password" ||
        req.path === "/auth/reset-password"
    ) {
        return next()
    }
    return requireLogin(req, res, next)
})

app.post("/api/trips", requireAdmin, async (req, res) => {
    try {
        const { trip_date, income, notes, truck_label, route_label, distance_km, fuel_consumed } = req.body
        const newTrip = await createTrip(
            trip_date,
            income,
            notes ?? null,
            truck_label ?? null,
            route_label ?? null,
            distance_km ?? 0,
            fuel_consumed ?? 0
        )
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

app.put("/api/trips/:id", requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { trip_date, income, notes, truck_label, route_label, distance_km, fuel_consumed } = req.body
        const updated = await updateTrip(
            id,
            trip_date,
            income,
            notes ?? null,
            truck_label ?? null,
            route_label ?? null,
            distance_km ?? 0,
            fuel_consumed ?? 0
        )
        if (!updated) {
            return res.status(404).json({ error: "Trip not found" })
        }
        res.json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update trip" })
    }
})

app.delete("/api/trips/:id", requireAdmin, async (req, res) => {
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

app.get("/api/reports/performance", async (req, res) => {
    try {
        const period = typeof req.query.period === "string" ? req.query.period : "month"
        const value = typeof req.query.value === "string" ? req.query.value : ""
        const bounds = getPeriodBounds(period, value)

        if (!bounds) {
            return res.status(400).json({ error: "Invalid period or value" })
        }

        const trucks = await getPerformanceReport(bounds.from, bounds.to)
        const summary = trucks.reduce(
            (acc, row) => {
                acc.trips_count += Number(row.trips_count ?? 0)
                acc.income_total += Number(row.income_total ?? 0)
                acc.fuel_total += Number(row.fuel_total ?? 0)
                acc.expense_total += Number(row.expense_total ?? 0)
                acc.distance_total += Number(row.distance_total ?? 0)
                acc.net += Number(row.net ?? 0)
                return acc
            },
            { trips_count: 0, income_total: 0, fuel_total: 0, expense_total: 0, distance_total: 0, net: 0 }
        )

        res.json({ ...bounds, summary, trucks })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to generate performance report" })
    }
})

app.get("/api/reports/daily.xlsx", requireAdmin, async (req, res) => {
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
            ? { day: "Date", income: "Revenu", fuel: "Carburant", distance: "Distance (km)", expenses: "Dépenses", net: "Net" }
            : { day: "Date", income: "Income", fuel: "Fuel", distance: "Distance (km)", expenses: "Expenses", net: "Net" }

        ws.columns = [
            { header: headers.day, key: "day", width: 14 },
            { header: headers.income, key: "income_total", width: 14 },
            { header: headers.fuel, key: "fuel_total", width: 14 },
            { header: headers.distance, key: "distance_total", width: 16 },
            { header: headers.expenses, key: "expense_total", width: 14 },
            { header: headers.net, key: "net", width: 14 },
        ]

        ws.getRow(1).font = { bold: true }

        for (const r of rows) {
            const dayVal = r.day instanceof Date ? r.day : new Date(String(r.day))
            ws.addRow({
                day: dayVal,
                income_total: Number(r.income_total ?? 0),
                fuel_total: Number(r.fuel_total ?? 0),
                distance_total: Number(r.distance_total ?? 0),
                expense_total: Number(r.expense_total ?? 0),
                net: Number(r.net ?? 0),
            })
        }

        ws.getColumn("day").numFmt = lang === "fr" ? "dd/mm/yyyy" : "mm/dd/yyyy"
        ws.getColumn("income_total").numFmt = "#,##0.00"
        ws.getColumn("fuel_total").numFmt = "#,##0.00"
        ws.getColumn("distance_total").numFmt = "#,##0.00"
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

app.post("/api/expenses", requireAdmin, async (req, res) => {
    try {
        const { expense_date, category, amount, notes, truck_label } = req.body
        const newExpense = await createExpense(expense_date, category ?? null, amount, notes ?? null, truck_label ?? null)
        res.status(201).json(newExpense)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to create expense" })
    }
})

app.put("/api/expenses/:id", requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id)
        const { expense_date, category, amount, notes, truck_label } = req.body
        const updated = await updateExpense(id, expense_date, category ?? null, amount, notes ?? null, truck_label ?? null)
        if (!updated) {
            return res.status(404).json({ error: "Expense not found" })
        }
        res.json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to update expense" })
    }
})

app.delete("/api/expenses/:id", requireAdmin, async (req, res) => {
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

ensureAuthSchema()
    .then(ensureOperationsSchema)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening to port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error("Failed to init auth schema", err)
        process.exit(1)
    })
