# IdeaV2 — Neev Bridge Consultancy Job Portal

Industrial-grade plan. Refines `Idea.md`.

**Repo:** https://github.com/SaniN30/Portal_NBC — all commits pushed here.
**Scale target:** smooth at **100,000+ candidate records** (see §11).

## 1. Scope

A web portal for **Neev Bridge Consultancy Manpower** with two roles:

- **Candidate (outsider)** — signs up, uploads profile + resume, browses live engineering jobs, applies, edits their details.
- **Admin** — views all candidates and their uploads, creates/edits/closes job listings, and contacts candidates.

Auth: passwordless **OTP** on every login, via **either email or phone**. OTP is sent to the channel the user chose.

## 2. Stack (chosen defaults — change before build if you disagree)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) on Vercel | Full-stack in one repo, native Vercel deploy, matches house context |
| Language | TypeScript | Type safety at boundaries |
| DB | Postgres (Neon via Vercel Marketplace) + Prisma | Relational data (users↔applications↔jobs); Prisma for typed queries/migrations |
| File storage | Vercel Blob (private) | Resume PDFs, presigned access |
| Auth/session | Custom OTP + signed JWT cookie (httpOnly) | Requirement is OTP-only, no password store |
| Email OTP | Resend (or Mailtrap in dev) | Simple transactional API |
| SMS OTP | Twilio Verify | Handles OTP generation/expiry/rate-limit for us |
| UI | Tailwind + shadcn/ui | Fast, accessible primitives |
| Validation | Zod | One schema, shared client+server |

> Lazy note: **Twilio Verify** and **Resend** own OTP generation, expiry, throttling, and delivery. Do not hand-roll an OTP table + cron cleanup unless you must self-host SMS. Email OTP can reuse the same "verify code" table if you'd rather not pay for two providers — decide in Phase 0.

## 3. Data model

```
User
  id, fullName, dob, phone (unique), email (unique),
  role: 'candidate' | 'admin',
  resumeBlobUrl, resumeUploadedAt,
  phoneVerified, emailVerified,
  createdAt, updatedAt

Job
  id, title, description, location, engineeringField,
  status: 'live' | 'closed',
  createdBy (admin userId), createdAt, updatedAt

Application
  id, userId, jobId, status: 'applied' | 'reviewed' | 'rejected' | 'shortlisted',
  appliedAt
  @@unique([userId, jobId])   // one apply per job

OtpChallenge   // only if self-hosting OTP; skip if Twilio Verify + Resend own it
  id, identifier (email|phone), channel, codeHash, expiresAt, attempts
```

## 4. Pages / routes

**Public**
- `/` — Home (about Neev Bridge)
- `/listing` — live jobs (apply button gated behind login)
- `/contact` — contact us
- `/login` — pick channel (email/phone) → enter identifier → enter OTP

**Candidate (auth required)**
- `/profile` — view/edit own details, upload/replace resume
- `/listing` apply action → creates Application
- `/applications` — jobs they've applied to

**Admin (role=admin required)**
- `/admin/candidates` — list + detail + resume download
- `/admin/jobs` — CRUD job listings
- `/admin/contact` — message candidates (email broadcast/individual)

## 5. API (route handlers)

```
POST /api/auth/request-otp   { channel, identifier }        -> send code
POST /api/auth/verify-otp    { channel, identifier, code }  -> set session cookie
POST /api/auth/logout

GET  /api/me                                     candidate profile
PUT  /api/me                                     update profile
POST /api/me/resume          (presigned upload)  resume to Blob

GET  /api/jobs               (public: live only; admin: all)
POST /api/jobs               admin
PUT  /api/jobs/:id           admin
DELETE /api/jobs/:id         admin (or set status=closed)

POST /api/applications       { jobId }           candidate applies
GET  /api/applications       own (candidate) / all (admin)

GET  /api/admin/candidates   admin
POST /api/admin/contact      admin -> email selected candidates
```

## 6. Auth flow (OTP)

1. User picks channel + enters email or phone.
2. `request-otp` → Twilio Verify (phone) or Resend code (email). Rate-limited per identifier.
3. `verify-otp` → on success, upsert User (first login creates the account), mark that channel verified, issue httpOnly signed JWT cookie (~7-day session).
4. Middleware guards `/profile`, `/applications`, `/admin/*`. Admin routes additionally check `role === 'admin'`.
5. Admin accounts are seeded manually (no public path to admin role).

## 7. Security & validation (do NOT trim)

- Zod validation on every route input.
- OTP rate limiting + max-attempts + short expiry (provider handles most).
- Resume: enforce PDF/DOC, size cap (e.g. 5 MB), private Blob, presigned download only for the owner or an admin.
- httpOnly + Secure + SameSite cookies; CSRF-safe (SameSite=Lax + POST-only mutations).
- Role checks server-side on every admin endpoint — never trust the client.
- Env-only secrets (`vercel env`), never committed.
- No PII (DOB, phone) leaked in error messages or logs.

## 8. Build phases (backend + frontend tracks)

Each phase ships a vertical slice. Commit per phase to the repo; open a PR, run `code-review`, merge.

### Phase 0 — Setup (shared)
- `vercel:bootstrap` Next.js + TS, Tailwind + shadcn, Prisma + Neon, Blob.
- Provision Resend + Twilio, set `vercel env` secrets.
- Prisma schema + first migration, seed one admin.
- `git init` → push to `SaniN30/Portal_NBC`, protect `main`, enable Vercel preview deploys per PR.

### Phase 1 — Auth
- **Backend**: `request-otp` / `verify-otp` route handlers, provider adapters (Twilio/Resend), rate limiter, JWT session issue/verify, middleware role guard. *(TDD verify + guard.)*
- **Frontend**: `/login` — channel toggle (email/phone) → identifier form → OTP entry, error/resend states, redirect on success.

### Phase 2 — Candidate profile
- **Backend**: `GET/PUT /api/me`, presigned resume upload to private Blob, owner-only download, file type/size validation.
- **Frontend**: `/profile` view/edit form (Zod-validated), resume upload/replace widget, `/` home (about Neev Bridge), `/contact`.

### Phase 3 — Jobs & apply
- **Backend**: `GET /api/jobs` (public=live only), `POST /api/applications` with unique-per-job dedupe, `GET /api/applications` (own).
- **Frontend**: `/listing` job cards + apply button (login-gated), `/applications` page.

### Phase 4 — Admin
- **Backend**: `GET /api/admin/candidates` (paginated), candidate detail + resume download, job CRUD, `POST /api/admin/contact` (email). All role-checked.
- **Frontend**: `/admin/candidates` table (search/paginate), detail drawer, `/admin/jobs` CRUD, `/admin/contact` compose.

### Phase 5 — Scale & ship
- Add DB indexes + pagination everywhere (see §11), connection pooling, load-test the candidates list at 100k rows.
- `security-scan`, `code-review`, e2e (candidate login→apply; admin post-job→view candidate), accessibility pass, production deploy.

## 9. Testing

- Unit: OTP verify, role guards, Zod schemas, apply-dedupe.
- Integration: auth flow, job CRUD, application creation.
- E2E: candidate login → complete profile → apply; admin login → post job → view candidate.
- Target 80%+ on business logic (auth, applications, admin authz).

## 11. Scale — 100,000+ records

100k rows is **small** for Postgres; a single Neon instance handles it comfortably. Do not reach for sharding, microservices, or a search cluster. The wins are boring and mandatory:

- **Indexes**: `User(email)`, `User(phone)`, `Application(userId, jobId)` unique, `Job(status)`, `Application(jobId)`. Add before load, not after.
- **Pagination everywhere**: no unbounded queries. Cursor-based (keyset) pagination on the admin candidates/applications lists — `LIMIT 25` + `WHERE id > cursor`. Never `OFFSET` deep into 100k rows.
- **Connection pooling**: use Neon's pooled connection string (PgBouncer) — serverless functions exhaust direct connections fast.
- **Select only needed columns**: the candidates list query must not pull `resumeBlobUrl` or full rows — id/name/email/status only; fetch detail on demand.
- **No N+1**: join or batch `Application`→`Job`/`User` in one query.
- **Server-side search/filter** on the admin list (indexed `ILIKE` or trigram), not client-side filtering of 100k rows.
- **Resumes live in Blob, not the DB** — DB stays lean, downloads go straight to storage via presigned URLs.
- **Cache the public `/listing`** (live jobs change rarely) with Next.js `revalidate`.

> ponytail: keyset pagination + indexes is the whole scale story at this size. Add a read replica / full-text search cluster only when a profiler on real traffic says so — not before.

## 12. Open decisions (confirm before Phase 0)

1. One OTP provider setup or two (Twilio + Resend vs. self-hosted email code)?
2. Resume formats allowed (PDF only, or DOC too)?
3. Admin "contact users" = email only, or in-app messages too? (Email-only is the lazy correct default.)
4. Do candidates need a separate signup, or is first OTP login the signup? (Plan assumes login = signup.)
