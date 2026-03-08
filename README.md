# Budget Tracker (Next.js)

A budget tracking web app built with **Next.js 14**, React, and Material UI. The UI talks to a remote Budget Tracker API (no local backend or database in this repo).

## Features

- **Login / Sign up**: Username + password; sign up includes full name, email, phone, and optional 4-digit recovery pin
- **Recovery pin**: 4-digit pin used to reset password when logged out (email + phone + pin)
- **Profile**: Update full name and phone; change password or recovery pin
- **Admin**: List users and reset user passwords (admin role only)
- **Dashboard**: Monthly expense summary, remaining budget, and quick actions
- **Add Bills / Add Expenses**: Forms with category and sub-category
- **Monthly Reports**: Bills and expenses for any month with budget progress
- **Settings**: Monthly budget and currency (USD, EUR, GBP, INR, etc.)
- **Responsive**: Mobile-friendly layout

## Requirements

- **Node.js 20+**
- Backend API (e.g. [Budget Tracker API](https://budget-api.rajatsharmajsdev.com) — Swagger: [API Docs](https://budget-api.rajatsharmajsdev.com/api-docs))

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env and set the backend API URL:

```bash
cp .env.example .env.local
```

Edit `.env.local` if needed (default points to the hosted API):

```
NEXT_PUBLIC_API_URL=https://budget-api.rajatsharmajsdev.com
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Different port:** `PORT=3001 npm run dev`
- **Production:** `npm run build` then `npm start`

### Hostinger (Node.js app)

Scripts use the **local** Next CLI (`npx next`), so no global `next` is required:

- **Build command:** `npm run build` (runs `npx next build`)
- **Start command:** `npm start` (runs `npx next start`)
- Set **Node version** to 20+ in the Hostinger panel.
- Add env var `NEXT_PUBLIC_API_URL` (your backend API URL) in the panel.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (no trailing slash). Default: `https://budget-api.rajatsharmajsdev.com` |

## Project structure

```
budget-tracker/
├── app/              # Next.js App Router (pages, layout)
├── components/       # Shared UI (Layout, LoginPage, etc.)
├── lib/
│   ├── api.ts       # Fetch helpers for remote API (uses NEXT_PUBLIC_API_URL)
│   ├── auth.ts      # Client auth (localStorage: user id, username, role)
│   ├── theme.ts     # MUI theme
│   └── types.ts     # Categories, currency codes, API shapes
├── .env.example
└── next.config.js
```

## Tech stack

- **Next.js 14** (App Router)
- **React 18**, **Material UI**, **TypeScript**
- **Node 20+**

## API

All requests go to `NEXT_PUBLIC_API_URL`. Authenticated endpoints use the `X-User-Id` header (set from login response). See [Swagger](https://budget-api.rajatsharmajsdev.com/api-docs) for full API reference.

Example:

```bash
# Health
curl -s https://budget-api.rajatsharmajsdev.com/health/db

# Login
curl -X POST https://budget-api.rajatsharmajsdev.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","password":"secret123"}'
```
