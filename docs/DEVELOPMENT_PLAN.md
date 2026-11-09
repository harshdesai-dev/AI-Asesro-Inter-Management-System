# AI ASESRO InternHub — Development Plan

## Product roles
- Admin: manage interns, teams, tasks, working-day attendance, meetings and performance.
- Intern: view assigned tasks, submit work, view own attendance and meetings.

## MVP modules
1. Authentication and server-side role authorization
2. Intern management
3. Team management
4. Individual and team task assignment and submissions
5. Working-day attendance (individual and bulk marking; Admin-only correction)
6. Meeting management with separate Present / Absent / Late attendance
7. Role-specific dashboards and basic performance overview

## Engineering constraints
- Do not rely on client-side navigation to enforce permissions.
- Attendance must have a unique intern + work date record.
- Meeting attendance is a separate record from working-day attendance.
- Preserve task submissions and attendance history.
- Use database constraints and transactions for state-changing workflows.
- Keep uploaded files, notifications, chat and AI features outside the deadline MVP.

## Delivery order
Foundation → Authentication → Interns/Teams → Tasks/Submissions → Daily Attendance → Meetings → Dashboards → QA/Deployment.

## Current status
- Repository was confirmed empty before initialization.
- Initial Next.js application scaffold and dashboard visual shell committed.
- Dashboard currently uses sample presentation data only; business workflows and database integration are not implemented yet.
