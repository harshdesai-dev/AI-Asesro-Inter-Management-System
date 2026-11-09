# AI ASESRO InternHub

Internal internship management platform for AI ASESRO.

## Product roles
- **Admin**: manages interns, teams, tasks, working-day attendance, meetings and performance.
- **Intern**: views assigned work, submits tasks, checks personal attendance and views meetings.

## Planned stack
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- REST endpoints under `/api/v1`
- Server-side role-based access control

## MVP scope
Authentication, intern/team management, individual and team task assignments, submissions, working-day attendance, meeting management, separate meeting attendance, role-specific dashboards and basic performance summaries.

## Development status
Initial repository scaffold is being established. See `docs/DEVELOPMENT_PLAN.md` for the implementation sequence.

## Local setup
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `AUTH_SECRET`.
3. Install dependencies with `npm install`.
4. Generate Prisma Client with `npm run db:generate`.
5. Apply migrations with `npm run db:migrate`.
6. Start the development server with `npm run dev`.

Do not commit real credentials or production environment files.
