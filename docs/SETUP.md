# Local development setup

## Requirements
- Node.js 20.9 or newer
- npm
- PostgreSQL 15 or newer

## Install
1. Clone this repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set a reachable PostgreSQL `DATABASE_URL`.
5. Set `AUTH_SECRET` to a random secret of at least 32 characters.
6. Set the initial Admin credentials in `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

## Database
1. Run `npm run db:generate`.
2. Run `npm run db:migrate -- --name init`.
3. Run `npm run db:seed` to create/update the initial Admin account.

The seed script hashes the Admin password. Do not commit `.env` or share production credentials.

## Run
- `npm run dev` — local development
- `npm run typecheck` — TypeScript validation
- `npm run lint` — ESLint
- `npm run build` — production build

## Important
The current dashboard presentation includes sample Admin dashboard figures. The database and API foundations are being implemented; do not treat sample dashboard metrics as real operational data until the dashboard is connected to the API.
