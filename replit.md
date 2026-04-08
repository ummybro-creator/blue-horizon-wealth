# Veltrix - FMCG Investment Platform

## Overview
Veltrix is a React + Vite FMCG investment platform with a mobile-first design. Users recharge wallets, invest in products, earn daily income, withdraw funds, and refer others through a 3-level referral commission system. Admins have a full dashboard for managing users, transactions, products, and settings.

## Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite (port 5000)
- **Routing**: React Router v6
- **State**: TanStack React Query for server state
- **UI**: Radix UI primitives + Tailwind CSS + shadcn/ui components
- **Charts**: Recharts

### Backend
- **Server**: Custom Express.js API server (port 3001 in dev)
- **Database**: Replit built-in PostgreSQL (via `DATABASE_URL` env var)
- **Auth**: JWT-based (30-day tokens stored in localStorage as `veltrix_auth_token`)
- **Client layer**: `src/lib/api-client.ts` — drop-in Supabase-compatible wrapper

### Key Data Flow
- Vite dev server proxies all `/api` requests → Express server on :3001
- Express handles auth, CRUD, and all RPC-style business logic
- `src/integrations/supabase/client.ts` re-exports `apiClient` as `supabase` (zero frontend changes needed)

## Running the App
```
npm run dev
```
Starts both the Express API server (port 3001) and Vite dev server (port 5000) via `concurrently`.

## Admin Credentials
- Email: `ummybro@gmail.com`
- Password: `mamuda@2023`
- Admin login URL: `/admin/login`

## Environment Variables
- `DATABASE_URL` — Replit PostgreSQL connection string (auto-provided)
- `SESSION_SECRET` — JWT secret (defaults to built-in dev key)
- `API_PORT` — Express port (defaults to 3001)

## Key Files
- `server/index.js` — Complete Express backend (schema init, auth, CRUD, RPC)
- `src/lib/api-client.ts` — Supabase-compatible client wrapper (uses fetch → Express)
- `src/integrations/supabase/client.ts` — Re-exports `apiClient` as `supabase`
- `src/contexts/AuthContext.tsx` — Auth state (JWT, profile, wallet, admin check)
- `src/pages/` — All page components (user + admin)
- `src/components/admin/` — Admin layout and components
- `vite.config.ts` — Vite config with `/api` proxy to :3001

## Database Schema (18 tables)
`users`, `profiles`, `wallets`, `user_roles`, `products`, `investments`, `recharges`, `withdrawals`, `bank_details`, `daily_checkins`, `referrals`, `app_settings`, `sliders`, `notifications`, `support_tickets`, `admin_logs`, `transaction_ledger`, `user_devices`, `referral_deposit_bonuses`

## Auth Design
- Regular users: phone number → stored as `phone@app.local` email in users table
- Admin: uses real email `ummybro@gmail.com` directly
- Both paths handled in `AuthContext.signIn`: detects `@` in input to route correctly

## Features
- Phone-based authentication (password login)
- Wallet system (recharge, withdrawal, bonus, income balances)
- Product investment with daily income crediting
- 3-level referral commission system (L1=13%, L2=5%, L3=2%, configurable)
- Daily check-in bonus
- Admin dashboard with stats, user management, recharge/withdrawal approval
- Revenue chart (30-day)
- Support ticket system
- Notification system
- App settings (UPI, QR code, support contacts, withdrawal/recharge toggles)
