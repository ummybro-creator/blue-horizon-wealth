# Veltrix - Investment Platform

## Overview
Veltrix is a React + Vite investment platform app with a mobile-first design. Users can recharge wallets, invest in products, earn daily income, withdraw funds, and refer others through a 3-level referral system. Admins have a full dashboard for managing users, transactions, products, and settings.

## Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **State**: TanStack React Query for server state
- **UI**: Radix UI primitives + Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

### Backend / Database
- **Auth + DB**: Supabase (external hosted service)
  - Auth: Phone-based (stored as `phone@app.local` emails)
  - Database: PostgreSQL with Row Level Security (RLS)
  - Edge Functions: admin-api and user-api (hosted on Supabase)

### Key Data Flow
- Frontend calls Supabase directly via `@supabase/supabase-js` client
- Admin functions use Supabase RPC calls (`approve_recharge`, `approve_withdrawal`, etc.)
- No local Express/Node server needed — all API logic lives in Supabase

## Environment Variables
Set in Replit's environment system (Secrets/Env Vars tab):
- `VITE_SUPABASE_URL` — Supabase project URL (shared)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key (safe for frontend, shared)
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID (shared)

## Running the App
```
npm run dev
```
Starts Vite dev server on port 5000.

## Building for Production
```
npm run build
```
Outputs static files to `dist/`. Deploy as a static site using `npx serve -s dist -l 3000`.

## Key Files
- `src/integrations/supabase/client.ts` — Supabase client setup
- `src/integrations/supabase/types.ts` — Auto-generated DB types
- `src/contexts/AuthContext.tsx` — Auth state management
- `src/pages/` — All page components (user + admin)
- `src/hooks/` — Data fetching hooks (useProducts, useRecharges, etc.)
- `src/components/admin/` — Admin layout and components
- `supabase/migrations/` — Full DB schema and all stored procedures

## Database Schema
Key tables: `profiles`, `wallets`, `products`, `investments`, `recharges`, `withdrawals`, `daily_checkins`, `referrals`, `user_roles`, `app_settings`, `sliders`, `support_tickets`, `notifications`, `admin_logs`, `transaction_ledger`, `user_devices`

## Features
- Phone-based authentication (OTP-style with password)
- Wallet system (recharge, withdrawal, bonus, income balances)
- Product investment with daily income crediting
- 3-level referral commission system (configurable %)
- Daily check-in bonus
- Admin dashboard with stats, revenue charts, user management
- Fraud detection via device/IP tracking
- Support ticket system
- Notification system

## Replit Migration Notes
- This is a pure frontend (React/Vite) app — no Express server needed
- Supabase handles all backend logic via RLS policies and stored procedures
- Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) are set as Replit shared env vars
- The `VITE_SUPABASE_PUBLISHABLE_KEY` is the anon/public key — safe to use in client-side code
- Dev server runs on port 5000 via `npm run dev`
- Production build outputs to `dist/` via `npm run build`
