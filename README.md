# Budget Tracker API

Backend API for the Budget Tracker app, built with **NestJS** and **MySQL**. No UI—API only.

## Features

- **Auth**: Login, signup, reset password (email + phone + recovery pin)
- **Profile**: Get/update profile, change password, update recovery pin
- **Expenses**: List, create, update, soft-delete, restore; list deleted
- **Bills**: List by date range, create bill
- **Settings**: Get/update monthly budget and currency
- **Summary**: Monthly totals (expenses, bills, budget)
- **Reports**: Monthly report data, historical and yearly aggregates
- **Admin**: List users, reset user password (admin role required)
- **Swagger**: Interactive API docs at `/api-docs`
- **Security**: Parameterized SQL, input validation, X-User-Id guard

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. MySQL

Copy env and set MySQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=budget_tracker
```

### 3. Run migrations

```bash
npm run db:setup
```

Or: `npm run db:create` then `npm run db:migrate`.

### 4. Start the API

**Development (watch):**

```bash
npm run start:dev
```

**Production (build then run):**

```bash
npm run build
npm run start:prod
```

- **Health (app only):** http://localhost:3001/health → `{ ok: true, app: "ok" }`
- **Health (app + MySQL):** http://localhost:3001/health/db → `{ ok, app, mysql, error? }`
- **Swagger UI:** http://localhost:3001/api-docs  

Port is configurable via `PORT` (default 3001).

## Hostinger deploy

1. **Application type:** Node.js (or Nest/Express).
2. **Build command:** `npm run build`
3. **Start command:** `npm run start:prod` or `node server.js` (entry file).
4. **Entry file (if required):** `server.js` (runs the built app from `dist/src/main.js`).
5. **Node:** 20 or 22.
6. **Env vars:** `PORT`, `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

Use the same MySQL settings as in hPanel (e.g. `localhost` and the DB name from Databases).

## API overview

| Path | Method | Auth | Description |
|------|--------|------|-------------|
| `/health` | GET | No | App liveness (`{ ok: true, app: "ok" }`) |
| `/health/db` | GET | No | App + MySQL connection (`{ ok, app, mysql, error? }`) |
| `/api/auth/login` | POST | No | Login |
| `/api/auth/signup` | POST | No | Sign up |
| `/api/auth/reset-password` | POST | No | Reset password |
| `/api/profile` | GET, PUT | X-User-Id | Profile |
| `/api/expenses` | GET, POST | X-User-Id | Expenses (POST: action create/update/delete/restore) |
| `/api/expenses/deleted` | GET | X-User-Id | Deleted expenses |
| `/api/bills` | GET, POST | X-User-Id | Bills |
| `/api/settings` | GET, PUT | X-User-Id | Settings |
| `/api/summary` | GET | X-User-Id | Monthly summary |
| `/api/reports` | GET | X-User-Id | Reports (query: month YYYY-MM) |
| `/api/admin/users` | GET | X-User-Id (admin) | List users |
| `/api/admin/users/:id/reset-password` | PUT | X-User-Id (admin) | Reset user password |

Protected routes require header **`X-User-Id`** (user ID from login response).

## Create admin user

In MySQL:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## Tech stack

- **NestJS 10** – API framework
- **MySQL (mysql2)** – Database, parameterized queries
- **Swagger** – API docs
- **date-fns** – Date handling
- **bcryptjs** – Password hashing

## Project structure

```
budget-tracker/
├── src/
│   ├── main.ts              # Bootstrap, Swagger
│   ├── app.module.ts
│   ├── auth/                # Login, signup, reset-password
│   ├── profile/
│   ├── expenses/
│   ├── bills/
│   ├── settings/
│   ├── summary/
│   ├── reports/
│   ├── admin/
│   ├── guards/              # X-User-Id guard
│   └── decorators/
├── lib/
│   ├── api-auth.ts          # Auth logic (login, signup, etc.)
│   ├── sanitize.ts
│   └── db/                  # MySQL client, queries, types
├── scripts/                 # Migrations, db:create, db:test
├── server.js                # Optional entry for Hostinger
└── .env
```
