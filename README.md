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
  - Filter trips by date range
- **Expenses management**
  - Create / edit / delete expenses
  - Filter expenses by date range
- **Daily report (monthly)** on the home page
  - Shows daily totals for income and expenses
  - Shows **net** (income − expenses)
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
    { "trip_date": "YYYY-MM-DD", "income": "123.45", "notes": "..." }
    ```

- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Expenses

- `GET /api/expenses`
  - Optional query:
    - `from=YYYY-MM-DD`
    - `to=YYYY-MM-DD`

- `GET /api/expenses/:id`

- `POST /api/expenses`
  - Body:
    ```json
    { "expense_date": "YYYY-MM-DD", "category": "...", "amount": "12.34", "notes": "..." }
    ```

- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

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

If you want, we can refactor the client to use an environment-based API URL (e.g. `VITE_API_BASE_URL`) for clean production deployments.

---

## Authentication notes (future work)

If you plan to add auth, good insertion points are:

- `server/app.js`
  - Add auth middleware (session/JWT)
  - Protect routes (e.g. `/api/trips`, `/api/expenses`, `/api/reports/*`)

- `client/app/root.tsx`
  - Add an auth provider/context
  - Add protected routes and redirects

When you add auth, prefer:

- server-side verification (never trust the client)
- consistent error responses (`401` / `403`)

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
