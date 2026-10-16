# Voice Berry

Voice Berry is a multilingual voice-enabled ride-booking application. Users can describe a ride by voice or enter the details manually, review an estimated fare, pay by Stripe or cash, and track the resulting booking from a dashboard.

## Features

- **Voice booking:** Captures speech in the browser and extracts pickup, destination, date/time, passenger count, vehicle type, flight number, and special instructions.
- **Manual booking:** Provides a form-based alternative when voice recognition is unavailable or the user prefers typing.
- **Multilingual input:** Supports the configured language options in the voice-booking screen.
- **Dynamic fare calculation:** Estimates distance and fare from the selected locations and vehicle type.
- **Card and cash payments:** Creates Stripe PaymentIntents for card payments and supports cash confirmation through the same booking workflow.
- **Booking lifecycle:** Creates a real booking before payment confirmation, prevents placeholder booking IDs, and keeps payment and booking state aligned.
- **Ride tracking:** Displays the current ride status and booking details.
- **Dashboard:** Includes upcoming rides, ride history, saved addresses, and profile settings.
- **Email receipts:** Sends booking/payment confirmation emails when Resend is configured.
- **AI chat and voice intent extraction:** Uses Groq for structured booking extraction and the in-app chat endpoint.
- **Location services:** Uses OpenStreetMap-compatible geocoding through the backend for address lookup.
- **Responsive UI:** Built with React, Tailwind CSS, shadcn-style components, Lucide icons, Framer Motion, and Leaflet-compatible mapping support.

## Technology and APIs

### Application stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript, Prisma
- **Database:** PostgreSQL, including Supabase PostgreSQL deployments
- **Authentication:** Supabase Auth
- **Payments:** Stripe Elements and Stripe PaymentIntents
- **AI:** Groq Chat Completions with JSON response format
- **Email:** Resend
- **Maps/geocoding:** OpenStreetMap-compatible geocoding
- **Browser voice input:** Web Speech API

### Preferable low-cost/free API options

The project is designed so that the following services can be used with free tiers or without a paid API key during development:

- **Web Speech API:** Browser-provided speech recognition; availability depends on the browser and operating system.
- **OpenStreetMap/Nominatim-compatible geocoding:** Suitable for low-volume development use. Follow the provider's usage policy and provide an identifying user-agent when deploying a public service.
- **Supabase:** Provides hosted PostgreSQL and authentication options with a free tier subject to current plan limits.
- **Groq:** The backend supports a Groq API key and configurable model. Availability and limits depend on the current Groq account plan.

Stripe and Resend require account credentials for their production features. Never put their secret keys in frontend code.

## Repository structure

```text
.
├── frontend/                 # React/Vite client
│   ├── src/components/       # Booking, dashboard, layout, and UI components
│   ├── src/pages/            # Landing, auth, dashboard, and tracking pages
│   ├── src/lib/              # API client, fare calculation, constants, Supabase client
│   └── .env.example          # Safe frontend configuration template
├── server/                   # Express/Prisma API
│   ├── src/controllers/      # Booking, payment, user, and address logic
│   ├── src/routes/           # REST route definitions
│   ├── prisma/               # Database schema and Prisma configuration
│   └── .env.example          # Safe server configuration template
├── scratch/                  # Local experiments and verification scripts
└── supabase_setup.sql        # Database policies/setup helpers
```

## Prerequisites

- Node.js 20 or later
- npm
- A PostgreSQL-compatible database for the server
- A Supabase project for authentication and Supabase client configuration
- Optional service accounts for Stripe, Groq, and Resend

## Local setup

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

This installs the root tools and dependencies for both the frontend and server.

### 2. Configure the frontend

Create the local file from the safe template:

```bash
cp frontend/.env.example frontend/.env
```

Set these values in `frontend/.env`:

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous key. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, such as `pk_test_...`. Never use a secret key here. |
| `VITE_API_URL` | Leave empty when the API is same-origin; use `http://localhost:3000` for the separate local API. |

### 3. Configure the server

Create the local server environment file:

```bash
cp server/.env.example server/.env
```

Set these values in `server/.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `DIRECT_URL` | Optional direct PostgreSQL connection string for Prisma migrations or provider-specific setups. |
| `PORT` | API port; defaults to `3000`. |
| `SUPABASE_URL` | Supabase project URL for server-side integrations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key. Do not expose it to the frontend. |
| `GROQ_API_KEY` | Groq API key for voice intent extraction and chat. |
| `GROQ_MODEL` | Optional Groq model override; the booking extractor has a configured default. |
| `STRIPE_SECRET_KEY` | Server-only Stripe secret key. |
| `RESEND_API_KEY` | Optional Resend key for email confirmations. |
| `FCM_SERVER_KEY` | Optional notification configuration retained for notification integrations. |

### 4. Prepare the database client

```bash
cd server
npx prisma generate
cd ..
```

Apply the Prisma schema using the migration workflow appropriate for your PostgreSQL environment. For a local development database, review `server/prisma/schema.prisma` before running a migration or `prisma db push`.

### 5. Start the application

Start both services from the repository root:

```bash
npm run dev
```

The default development URLs are:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

Vite proxies `/api` and `/health` to the local API during development. You can also run the services independently:

```bash
npm run dev:frontend
npm run dev:server
```

## API overview

The API is mounted under `/api` and the health endpoint is available at `/health`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/profile` | Create or update the authenticated user's profile. |
| `POST` | `/api/bookings/extract-intent` | Extract structured booking details from a transcript with Groq. |
| `POST` | `/api/bookings` | Create a booking. |
| `GET` | `/api/bookings/:userId` | List bookings for a user. |
| `PATCH` | `/api/bookings/:id` | Update an existing booking during checkout/editing. |
| `GET` | `/api/rides/:bookingId` | Read ride/tracking data for a booking. |
| `PATCH` | `/api/rides/:id/status` | Update ride status. |
| `POST` | `/api/payments/intent` | Create a Stripe PaymentIntent for an existing booking. |
| `POST` | `/api/payments/confirm` | Confirm card or cash payment and finalize the booking. |
| `POST` | `/api/chat` | Send a message to the backend chat integration. |
| `GET` | `/api/addresses/:userId` | List saved addresses. |
| `POST` | `/api/addresses` | Save an address. |
| `DELETE` | `/api/addresses/:id` | Delete a saved address. |
| `GET` | `/api/users/:id` | Read a user profile. |
| `PATCH` / `PUT` | `/api/users/:id` | Update a user profile. |
| `POST` | `/api/webhooks/stripe` | Receive Stripe webhook events. |
| `POST` | `/api/webhooks/notifications/register` | Register notification settings. |

## Booking and payment flow

1. The user provides ride details by voice or manual input.
2. The frontend calculates an estimated fare from the route and vehicle type.
3. For card checkout, the server creates or updates a real booking first.
4. The server validates that the PaymentIntent amount matches the booking fare.
5. Stripe confirms the payment on the client using Stripe Elements.
6. The server confirms the booking using the real booking ID and records the payment idempotently.
7. Cash bookings use the same booking and confirmation path without creating a Stripe PaymentIntent.
8. A confirmation email is sent when Resend is configured.

If voice processing is unavailable, the application shows a fallback message and directs the user to manual booking. If Stripe is not configured, users can choose cash payment.

## Verification and quality checks

Run the frontend build:

```bash
cd frontend
npm run build
```

Generate Prisma Client and typecheck the server:

```bash
cd server
npx prisma generate
npm run typecheck
```

Run the frontend lint command:

```bash
cd frontend
npm run lint
```

The current project does not define a server test suite yet. The `scratch/` directory contains local verification scripts and should not be treated as production tests.

## Security and environment-file policy

- **Never commit `frontend/.env`, `server/.env`, or any other environment file.** They are ignored by the repository rules.
- Only `.env.example` templates belong in GitHub, and they must contain placeholders rather than credentials.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, and database connection strings on the server only.
- Expose only the Supabase anonymous key and Stripe publishable key through Vite environment variables.
- Rotate a credential immediately if it is accidentally exposed.
- Do not commit `node_modules/`, `frontend/dist/`, logs, local editor settings, or generated secrets.

## Deployment notes

For production:

1. Build the frontend with `npm run build`.
2. Run the server with production environment variables and a managed PostgreSQL database.
3. Serve the frontend and API from one origin when possible, or set `VITE_API_URL` to the deployed API URL.
4. Configure the Stripe webhook endpoint at `/api/webhooks/stripe` and verify the webhook signing secret in the server implementation before enabling live payments.
5. Configure CORS, HTTPS, database backups, rate limits, and provider usage policies for the chosen hosting environment.
6. Use Stripe test keys and a non-production database until the complete payment and webhook flow has been verified.

## License

No license has been declared for this repository yet. Add a `LICENSE` file before distributing the project publicly.
