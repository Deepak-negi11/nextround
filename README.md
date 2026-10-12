# NextRound — Campus Placement Portal

A full-stack placement management system: eligibility-gated company drives, flexible selection rounds (online/offline), interviewer outcomes, offers, live analytics, and senior roadmaps.

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · PostgreSQL · Prisma · Tailwind CSS v4 · JWT cookie auth (jose + bcryptjs)

## Quick start

```bash
# 1. PostgreSQL must be running locally on :5432
createdb nextround

# 2. Configure (already set for local Homebrew Postgres)
#    .env — DATABASE_URL + AUTH_SECRET
#    (If you use the Docker Postgres on :5433 instead, set
#     DATABASE_URL="postgresql://postgres:deepak@127.0.0.1:5433/postgres")

# 3. Install, migrate, seed
bun install        # or: npm install
npx prisma migrate dev
npx prisma db seed   # or: bun run db:seed

# 4. Run
bun run dev       # or: npm run dev → http://localhost:3000
```

## Using Supabase instead of local Postgres

Supabase is hosted PostgreSQL, so Prisma works unchanged — only the connection strings change.

1. Supabase dashboard → your project → **Connect** → **ORMs** → **Prisma**. Copy both strings.
2. In `.env` (see `.env.example`), set:
   - `DATABASE_URL` — for `next dev` / `next start`: the **session** pooler, port **5432**, ending in
     `?connection_limit=5` (about 4× faster per query than the transaction pooler in testing).
     On serverless hosts (Vercel) use the **transaction** pooler instead: port **6543**, ending in `?pgbouncer=true`.
   - `DIRECT_URL` — session pooler / direct connection, port **5432** (used by `prisma migrate`)
   - Replace `[YOUR-PASSWORD]` with the database password, **URL-encoded** if it has spaces or
     symbols (space → `%20`, `@` → `%40`, `#` → `%23`).
3. Create the tables and the demo accounts on Supabase:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. `bun run dev`, then open http://localhost:3000/health — it should report `"database": {"status": "ok"}`.

**Pick the region closest to your users.** Every query is a network round trip: from Delhi, a Sydney
project costs ~450 ms per trip, while Mumbai (`ap-south-1`) is a few tens of ms. Region can't be changed
after a project is created.

Data is not copied automatically: the steps above give you an empty schema plus the three demo accounts.

## Deploying to Vercel

1. **Replace the demo passwords** on the database you will deploy against (they are public in this README):
   ```bash
   bun run user:password admin@college.edu
   bun run user:password interviewer@college.edu
   bun run user:password student@college.edu
   ```
   The new password is typed at a hidden prompt.
2. **Apply migrations** from your machine — Vercel does not run them: `npx prisma migrate deploy`.
3. On vercel.com: **Add New → Project →** import this repo. Next.js and Bun are detected automatically;
   `postinstall` runs `prisma generate` so the build always gets a fresh Prisma Client.
4. **Environment variables** (Project → Settings → Environment Variables):
   - `DATABASE_URL` — Supabase **transaction** pooler, port 6543:
     `...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
     (each serverless instance keeps one connection; the pooler multiplexes them)
   - `DIRECT_URL` — Supabase session pooler, port 5432 (only used by migrations, but Prisma expects it)
   - `AUTH_SECRET` — a **new** value from `openssl rand -base64 32`. The app refuses to sign people in
     without one of at least 32 characters.
   - `STUDENT_EMAIL_DOMAINS` — e.g. `college.edu,gehu.ac.in`
5. **Region:** `vercel.json` pins the server to `syd1` (Sydney) to sit next to the Supabase project.
   If you move the database to another region, change it to match (Mumbai is `bom1`).
6. Deploy. Then open `https://<your-app>.vercel.app/health` — it should report `"database": {"status": "ok"}`.

In production the sign-in page hides the one-click demo logins, and the session cookie is HTTPS-only.

## Demo accounts (created by `prisma/seed.ts`)

One-click buttons for these appear on `/login` in development only. Change their passwords before deploying (see above).

| Role | Email | Password |
|---|---|---|
| Placement Admin | `admin@college.edu` | `admin123` |
| Interviewer | `interviewer@college.edu` | `int123` |
| Student (CSE, CGPA 8.5) | `student@college.edu` | `student123` |

## The flow (from the whiteboard)

1. **Admin** creates a company drive → sets eligibility (branches, min CGPA, max backlogs) → adds rounds → publishes.
2. **Only eligible students** can apply (reasons shown when blocked; rule re-enforced server-side; DB blocks duplicates).
3. Admin **announces a round** — students see test link + instructions (online) or venue/building/room/reporting time (offline).
4. Interview rounds get **slots** — students pick their own.
5. **Interviewer/Recruiter** views assigned candidates and records **Selected / Rejected / NextRound / Absent** (+ score, rank, remarks).
6. Admin **publishes round results** — NEXT_ROUND moves students forward; the last round marks them SELECTED and completes the drive.
7. Admin **issues the offer** → student **accepts or declines** → dashboard statistics update.
8. Analytics + full placement report; **Senior Roadmaps** show how alumni landed Google/Amazon/Microsoft/JP Morgan (DSA vs AI/ML vs Web Dev routes).

## Data model

`User/Student · Company · Drive · EligibilityRule · DriveBranch · Application · Round · RoundPanelist · InterviewSlot · RoundResult · Offer · Roadmap` — mirrors the ER diagram (`prisma/schema.prisma`).

## Seeded demo state

The seed creates only the three accounts above. Everything else is created in the app:

- **Admin → Companies / Drives** — companies, drives, eligibility, rounds, slots, panelists, results, offers.
- **Admin → Users** — add students and interviewers/recruiters.
- **Admin → Roadmaps** — publish senior roadmaps (shown to students).
- **/register** — students sign up themselves with a college email. Allowed domains come from
  `STUDENT_EMAIL_DOMAINS` in `.env` (comma-separated, default `college.edu`), e.g.
  `STUDENT_EMAIL_DOMAINS="college.edu,gehu.ac.in"`.
