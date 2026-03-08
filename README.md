# Budget Tracker

A budget tracking web application built with Next.js, React, Material UI, and **MySQL**.

## Features

- **📱 Login / Sign up**: Username + password; sign up includes full name, email, phone, and optional 4-digit recovery pin
- **🔐 Recovery pin**: 4-digit pin used to reset password when logged out (email + phone + pin)
- **👤 Profile**: Update full name and phone; change password or recovery pin (separate actions; recovery pin is never shown)
- **👑 Admin**: Log in as admin to access Admin panel—list users (email, phone for contact), reset user passwords when requested
- **💰 Dashboard**: Monthly expense summary, remaining budget, and quick actions
- **📝 Add Bills**: Multi-step form to add bills
- **📊 Monthly Reports**: Bills and expenses for any month with budget progress
- **📈 Historical Reports**: Spending patterns for the last 6 months
- **⚙️ Settings**: Monthly budget and currency (USD, EUR, GBP, INR, etc.)
- **💸 Add Expenses**: Add expenses with description, amount, category, and date
- **🔒 Security**: Parameterized SQL (injection-safe), input validation, XSS-safe output
- **📱 Responsive**: Mobile-friendly layout and touch targets

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MySQL

Ensure MySQL (or MariaDB) is installed and running. Create a database and configure env:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MySQL credentials:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=budget_tracker
```

### 3. Run Migrations

Create the database and tables:

```bash
npm run db:setup
```

Or step by step:

```bash
npm run db:create   # Creates database if not exists
npm run db:migrate # Runs SQL migrations in scripts/migrations/
```

### Hostinger MySQL: "Access denied for user ... @ '107.134.235.190'"

That error means the MySQL user is not allowed to connect **from the IP** your app is using (`107.134.235.190`).

**Option A – App and MySQL on the same Hostinger server (recommended)**  
Run your Node app on the same hosting account as the database (e.g. deploy the app on Hostinger). Then in `.env` use:

- `MYSQL_HOST=localhost` (or the MySQL hostname shown in hPanel → Databases)
- `MYSQL_USER=u646670068_budget_user`
- `MYSQL_PASSWORD=<your DB password>`
- `MYSQL_DATABASE=u646670068_budget_tracker` (or the exact DB name from hPanel)

Hostinger usually allows the DB user to connect from `localhost` when the app is on the same server, so no extra step is needed.

**Option B – App runs elsewhere (e.g. your PC or another host)**  
The DB user must be allowed to connect from that machine’s IP:

1. In **hPanel** go to **Databases** → **Remote MySQL** (or **MySQL Remote Access**).
2. Add the IP your app uses: **107.134.235.190** (or “Any” for testing only).
3. In `.env` use the **MySQL server hostname** from Hostinger (e.g. `mysqlXX.hostinger.com` or the value in “Hostname” in the database details), not `localhost`.
4. Ensure **username**, **password**, and **database name** match exactly what’s in hPanel (case-sensitive).

Then run `npm run db:test` to verify the connection.

### Create an admin user

To access the Admin panel, set a user's role to `admin` in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

Then log in with that username (and password). You will see an **Admin** button and can open the Admin panel to list users and reset their passwords.

### 4. Start the App

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

- **Port in use?** Set another port: `PORT=3002 npm run dev`, then open `http://localhost:3002`.
- **Check server is up:** Open [http://localhost:3001/health](http://localhost:3001/health) — should return `{"ok":true}`.

For production build:

```bash
npm run build
npm start
```

### Deploying to Hostinger (Node.js) — API must use custom server

This app uses a **custom server** (Express serves `/api/*` and Next.js serves the UI). If you deploy as a **Next.js app**, the host runs only the Next.js server, so **`/api/auth/login` and all other API routes return 404**.

**Do this on Hostinger:**

1. In the Node.js application settings, set **Application type** to **Node.js** (not “Next.js”).
2. **Build command:** `npm run build`
3. **Start command:** `npm start`  
   This runs the custom server (`server/index.ts`) so both the API and the Next.js UI are served from the same app.
4. Set **Node version** to 22 (or 20).
5. Add your env vars in the Hostinger panel (e.g. `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `PORT` if required). Use the same DB host/user/name as in hPanel (e.g. `localhost` and the DB name from Databases).
6. After deploy, open `https://your-subdomain/health` — it should return `{"ok":true}`. Then try login again; `/api/auth/login` should respond.

`tsx` is included in **dependencies** so `npm start` works in production.

## Usage

1. **Login**: Enter a username (letters, numbers, underscores; 1–50 chars).
2. **Dashboard**: View monthly summary and quick actions.
3. **Add Bill** / **Add Expense**: Use the bottom nav or dashboard buttons.
4. **Reports**: Select a month and switch between monthly and historical tabs.
5. **Settings**: Set monthly budget and currency.

## Architecture

**One Node.js app: Express (backend) + Next.js (UI)**

- **Express** listens on port 3001 and handles:
  - **Backend API** at `/api/*` (auth, expenses, bills, settings, summary, reports)
  - All other requests are passed to **Next.js** for the React UI
- **Next.js** serves pages, layout, and client-side routing (no Next.js API routes).

Run a single process: `npm run dev` (development) or `npm run build && npm start` (production).

## Tech Stack

- **Node.js** + **Express**: API server
- **Next.js 14**: React UI (App Router)
- **React 18**, **Material UI**, **TypeScript**
- **MySQL (mysql2)**: Database with parameterized queries
- **date-fns**: Date formatting
- **tsx**: Run TypeScript server without pre-compiling

## Project Structure

```
budget-tracker/
├── server/                 # Express backend (same process as Next.js)
│   ├── index.ts            # Entry: Express + Next.js, single port
│   ├── middleware/
│   │   └── auth.ts         # Require X-User-Id, set req.userId
│   └── routes/
│       ├── auth.ts         # POST /api/auth/login
│       ├── expenses.ts     # GET/POST /api/expenses
│       ├── bills.ts        # GET/POST /api/bills
│       ├── settings.ts     # GET/PUT /api/settings
│       ├── summary.ts      # GET /api/summary
│       └── reports.ts      # GET /api/reports
├── app/                    # Next.js UI (pages only)
│   ├── dashboard/
│   ├── add-bill/
│   ├── add-expense/
│   ├── reports/
│   ├── settings/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── lib/
│   ├── api.ts              # Client API helpers (fetch /api/*)
│   ├── api-auth.ts         # loginOrRegister, used by server
│   ├── auth.ts             # Client auth (localStorage)
│   ├── sanitize.ts
│   ├── theme.ts
│   └── db/                 # MySQL client, types, queries
├── scripts/
│   ├── create-database.js
│   ├── run-migrations.js
│   └── migrations/
└── .env / .env.example
```

## Security

- **SQL injection**: All DB access uses parameterized queries via `mysql2` (no string concatenation).
- **XSS**: User input is validated and length-limited; `lib/sanitize.ts` provides HTML escaping for display.
- **Validation**: Categories and currency are whitelisted; amounts and dates are validated before persistence.
