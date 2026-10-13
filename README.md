# Voice Berry

A multilingual voice-enabled ride-booking application that extracts booking details from speech, supports manual booking, accepts Stripe card or cash payments, stores bookings in Supabase/PostgreSQL, and sends confirmation emails.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Stripe Elements, Supabase Auth
- **Backend:** Node.js, Express, Prisma, PostgreSQL/Supabase
- **Integrations:** Stripe Payments, Groq voice intent extraction, Resend email, OpenStreetMap geocoding

## Project structure

- `/frontend` — React/Vite client application
- `/server` — Express API and Prisma database layer
- `/scratch` — Experimental scripts
- `supabase_setup.sql` — Supabase database policies and setup

## Setup

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Create `frontend/.env` from [`frontend/.env.example`](frontend/.env.example) and set:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` — must be the Stripe **publishable** key (`pk_test_...` or `pk_live_...`)
   - `VITE_API_URL` — leave empty for a same-origin deployment; use `http://localhost:3000` for a separate local API

3. Create `server/.env` from `server/.env.example` and set the database, Supabase service role, Stripe secret, Groq, and Resend values.

4. Generate Prisma Client and start both services:

   ```bash
   cd server && npx prisma generate
   cd .. && npm run dev
   ```

   The Vite development server proxies `/api` requests to `http://localhost:3000`. For production, either serve the API from the same origin or set `VITE_API_URL` to the deployed API URL.

## Payment flow

- The payment page creates a PaymentIntent with the server.
- On confirmation, it creates a real booking using the authenticated Supabase user (never a placeholder or anonymous ID).
- Stripe is confirmed only after booking creation succeeds.
- The server confirms the real booking ID, upserts an idempotent payment record, and sends the receipt email when Resend is configured.
- Cash bookings use the same real-booking and confirmation API path.

## Verification

```bash
cd frontend && npm run build
cd ../server && npx prisma generate && npm run typecheck
```

The frontend lint command currently reports existing non-blocking warnings but no errors:

```bash
cd frontend && npm run lint
```
