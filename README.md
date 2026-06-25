# Compta

Compta is a lightweight accounting tracker to help you manage:

- Trips income (CRUD)
- Expenses (CRUD)
- Daily net reports (income − expenses)
- Monthly Excel export (.xlsx)

It’s built as a small monorepo with:

- `server/`: Node.js + Express + PostgreSQL
- `client/`: React Router v7 (SSR) + FlyonUI + Tailwind

---

## Table of contents

- [Features](#features)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Local development](#local-development)
  - [Prerequisites](#prerequisites)
  - [Server setup](#server-setup)
  - [Client setup](#client-setup)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
  - [Trips](#trips)
  - [Expenses](#expenses)
  - [Reports](#reports)
- [Excel export](#excel-export)
- [Internationalization (i18n)](#internationalization-i18n)
- [Deployment (Docker / Coolify on VPS)](#deployment-docker--coolify-on-vps)
  - [Server container](#server-container)
  - [Client container](#client-container)
  - [Important: configuring API base URL](#important-configuring-api-base-url)
- [Authentication notes (future work)](#authentication-notes-future-work)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Trips table on home page**
  - Create / edit / delete trips
  - Track truck type / plate number, route, distance, consumed fuel, and net trip gain
  - Filter trips by date range
- **Expenses management**
  - Create / edit / delete expenses
  - Attach expenses to a truck and classify tire, fuel, oil change, maintenance, and similar costs
  - Filter expenses by date range
- **Daily report (monthly)** on the home page
  - Shows daily totals for income, fuel deduction, distance, and expenses
  - Shows **net** (income − consumed fuel − expenses)
- **Truck performance report**
  - Weekly, monthly, and yearly performance by truck
  - Shows gross gain, fuel deduction, expenses, distance, net gain, and performance per km
  - Month picker
- **Download monthly Excel report**
  - `lang=en|fr` support

---

## Project structure

```text
compta/
  README.md
  server/
    app.js
    Dockerfile
    .dockerignore
    db/
      pool.js
      queries.js
      populatedb.js
  client/
    Dockerfile
    .dockerignore
    package.json
    react-router.config.ts
    vite.config.ts
    app/
      root.tsx
      routes.ts
      routes/
      components/
      i18n/
```

---

## Tech stack

- **Backend**: Node.js, Express, `pg` (PostgreSQL)
- **Frontend**: React Router v7 (SSR), React, TypeScript
- **UI**: FlyonUI + Tailwind CSS
- **Dates**: `date-fns` with locale-aware formatting
- **Excel export**: `exceljs`

---

## Local development

### Prerequisites

- Node.js 20+ (22 recommended)
- npm
- A PostgreSQL database (local or hosted)

### Server setup

```bash
cd server
npm install
```

Create a `server/.env`:

```env
PORT=3000
DB_HOST=...
DB_USER=...
DB_PWD=...
DB_NAME=...
DB_PORT=5432
```

Run the API:

```bash
npm run dev
# or
npm start
```

Server runs at:

- `http://localhost:3000`

### Client setup

```bash
cd client
npm install
npm run dev
```

Client runs at whatever port React Router dev server chooses (often shown in the terminal output).

---

## Environment variables

### Server (`server/.env`)

- `PORT`: server port (default: `3000`)
- `DB_HOST`, `DB_USER`, `DB_PWD`, `DB_NAME`, `DB_PORT`: PostgreSQL connection
- `SESSION_SECRET`: session cookie signing secret (required in production)
- `ADMIN_SIGNUP_TOKEN`: required to call `POST /api/auth/signup` (used to create the first user safely)
- `ADMIN_DEFAULT_PASSWORD`: bootstrap password that promotes an existing user to admin during login (default: `C0mpta1sC0011`)
- `PUBLIC_SIGNUP_ENABLED`: set to `true` to allow anyone to sign up without `x-admin-signup-token` (default: disabled)
- `CLIENT_BASE_URL`: used to generate password reset links (e.g. `https://compta.bysolitdio.com`)

**Do not commit secrets**. In production (Coolify), configure these in the service environment settings.

---

## API reference

Base URL (local): `http://localhost:3000`

### Trips

- `GET /api/trips`
  - Optional query:
    - `from=YYYY-MM-DD`
    - `to=YYYY-MM-DD`

- `POST /api/trips`
  - Body:
    ```json
    {
      "trip_date": "YYYY-MM-DD",
      "truck_label": "Camion A / ML-001",
      "route_label": "Kati - Faladiè",
      "distance_km": "32",
      "fuel_consumed": "25000",
      "income": "125000",
      "notes": "..."
    }
    ```

- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

`POST/PUT/DELETE` are **admin-only**.

### Expenses

- `GET /api/expenses`
  - Optional query:
    - `from=YYYY-MM-DD`
    - `to=YYYY-MM-DD`

- `GET /api/expenses/:id`

- `POST /api/expenses`
  - Body:
    ```json
    {
      "expense_date": "YYYY-MM-DD",
      "truck_label": "Camion A / ML-001",
      "category": "Achat pneus",
      "amount": "45000",
      "notes": "..."
    }
    ```

- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

`POST/PUT/DELETE` are **admin-only**.

### Truck performance

- `GET /api/reports/performance`
  - Query:
    - `period=week|month|year`
    - `value=YYYY-MM-DD` for week, `YYYY-MM` for month, `YYYY` for year
  - Response includes:
    - `summary`
    - `trucks[]` with `trips_count`, `income_total`, `fuel_total`, `expense_total`, `distance_total`, `net`, and `performance_per_km`

### Authentication

This app uses **Passport.js Local Strategy** with **cookie-based sessions**.

- `POST /api/auth/login`
  - Body:
    ```json
    { "username": "...", "password": "..." }
    ```
- `POST /api/auth/logout`
- `GET /api/auth/me`

To create a user (intended for bootstrapping your first account):

- `POST /api/auth/signup`
  - Header: `x-admin-signup-token: <ADMIN_SIGNUP_TOKEN>`
  - Body:
    ```json
    { "username": "...", "password": "..." }
    ```

Admin access is controlled by a boolean column on the DB user record (`users.is_admin`).

Password reset endpoints (email delivery not implemented yet):

- `POST /api/auth/forgot-password`
  - Body:
    ```json
    { "username": "..." }
    ```
  - Returns `{ ok: true, resetUrl }` for manual testing.

- `POST /api/auth/reset-password`
  - Body:
    ```json
    { "token": "...", "newPassword": "..." }
    ```

Client pages:

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password?token=...`

### Reports

- `GET /api/reports/daily?month=YYYY-MM`
  - Returns daily rows:
    - `day`, `income_total`, `expense_total`, `net`

---

## Excel export

- `GET /api/reports/daily.xlsx?month=YYYY-MM&lang=en|fr`

This downloads an Excel file with columns:

- Date
- Income / Revenu
- Expenses / Dépenses
- Net

The client UI includes:

- month picker
- download button

---

## Internationalization (i18n)

The UI supports English/French switching.

Translations live in:

- `client/app/i18n/translations.ts`

The language toggle is in the navbar.

---

## Deployment (Docker / Coolify on VPS)

This repo is designed to be deployed as **two services**:

- `server` (Express API)
- `client` (React Router SSR)

### Server container

- Dockerfile: `server/Dockerfile`
- Exposes: `3000`

In Coolify:

- Build context: `server`
- Port: `3000`
- Add env vars for DB + `PORT=3000`

### Client container

- Dockerfile: `client/Dockerfile`
- Exposes: `3000`

In Coolify:

- Build context: `client`
- Port: `3000`

### Important: configuring API base URL

In production, the client should **not** call `http://localhost:3000` unless the API is on the same container.

Recommended:

- Serve the client on a domain (e.g. `https://compta.example.com`)
- Route API traffic to the server service either:
  - same domain under `/api`, or
  - separate subdomain like `https://api-compta.example.com`

The client uses `VITE_API_BASE_URL` to talk to the API.

In Coolify (client service), set:

```env
VITE_API_BASE_URL=https://api-compta.bysolitdio.com
```

Because auth uses cookie sessions across subdomains, make sure the API is served over HTTPS.

---

## Authentication

### Database table

Create a `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false
);
```

You can grant admin rights by setting `is_admin = true` for a user in your DB console.

### Cookie/session behavior in production

When deploying with different subdomains (e.g. `compta...` and `api-compta...`), cookies are cross-site.

The server is configured to use:

- `SameSite=None` + `Secure` in production
- CORS `credentials: true`

And the client sends requests with `credentials: "include"` for admin-protected actions.

---

## Troubleshooting

- **Expense creation fails**
  - Your DB schema requires `expenses.id` and may not have a default.
  - The server inserts `MAX(id)+1` to generate ids without altering tables.

- **CORS / Failed to fetch**
  - Ensure server is reachable from the client.
  - In production, remove hardcoded localhost URLs and use proper routing.

- **Timezone-looking dates**
  - Postgres date/timestamp serialization can appear as `...T21:00:00.000Z`.
  - UI uses `date-fns` formatting; server groups by `::date`.
