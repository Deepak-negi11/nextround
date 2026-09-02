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

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Placement Admin | `admin@college.edu` | `admin123` |
| Interviewer (Amazon) | `interviewer@amazon.com` | `int123` |
| Recruiter (JP Morgan) | `recruiter@jpmorgan.com` | `int123` |
| Students | `aarav0@college.edu` … `ishita7@college.edu` | `student123` |

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

- **Amazon — Software Engineer Intern** (₹45 LPA, CSE/IT, CGPA ≥ 7.0, no backlog): published, 4 applied, Aptitude completed (3 shortlisted, 1 rejected), Technical Interview announced with slots and an assigned interviewer — **record outcomes as the interviewer, publish as admin, issue an offer, accept it as the student**.
- **JP Morgan — Software Engineer Analyst** (₹22 LPA, CSE/IT/ECE, CGPA ≥ 6.0, ≤1 backlog): published, open to apply.
- **Google — STEP Intern**: draft (try the full authoring flow).
- 4 senior roadmaps.
