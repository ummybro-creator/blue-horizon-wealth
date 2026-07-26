# Veltrix App

A multi-page earnings/referral platform built with React + TypeScript (Vite) on the frontend and Express + PostgreSQL on the backend.

## Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router v6
- **Backend**: Express (Node.js), PostgreSQL (via `pg`)
- **Auth**: JWT (SESSION_SECRET)

## Running the app
```sh
bun run dev
```
- Vite dev server → port 5000 (frontend)
- Express API server → port 3001 (backend)

## User preferences
- **Frontend only**: All edits go in `src/`. Do not touch `server/` or backend code.

## Key frontend directories
- `src/pages/` — all page-level components (Login, Register, Dashboard, Profile, etc.)
- `src/components/` — shared UI components
- `src/contexts/` — React context providers (auth, etc.)
- `src/hooks/` — custom hooks
- `src/lib/` — utilities and API helpers
- `src/data/` — static data / mock data

## Environment variables
| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | JWT signing secret (set in Replit Secrets) |
| `DATABASE_URL` | PostgreSQL connection string (backend only) |
| `VITE_SUPABASE_URL` | Supabase project URL (set in .replit userenv) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (set in .replit userenv) |
