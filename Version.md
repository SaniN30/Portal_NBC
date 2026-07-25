# Version — Neev Bridge Consultancy Job Portal

**Live:** https://portal-nbc.vercel.app
**Repo:** https://github.com/SaniN30/Portal_NBC
**Stack:** Next.js 16 (App Router, TS) · Prisma 7 + Neon Postgres · Vercel Blob · Resend (email OTP) · Twilio (SMS OTP) · Tailwind v4
**Last updated:** 2026-07-25

---

## ✅ Completed

### Phase 0 — Setup
- Next.js + TypeScript + Tailwind scaffold
- Prisma 7 schema: `User`, `Job`, `Application`, `OtpChallenge` (+ enums), with indexes and unique constraints for the 100k-record scale target
- pg driver-adapter Prisma singleton (lazy, pooled-connection ready)
- Initial migration generated and applied on deploy (`prisma migrate deploy` in build)
- Neon Postgres + Vercel Blob provisioned and connected; env wired
- Deployed to Vercel production

### Phase 1 — Auth / OTP
- Passwordless login via **email or phone**, OTP required every sign-in
- One self-hosted OTP path for both channels (code gen, sha256 hash, timing-safe compare, 10-min expiry, 5-attempt cap, 30s resend cooldown)
- jose HS256 JWT session in an httpOnly / SameSite=Lax cookie
- Pluggable sender: Resend (email) / Twilio (SMS); dev logs the code
- Middleware guards `/profile`, `/applications`, `/admin` (admin role-checked)
- **Login = signup** (first verified OTP creates the account)
- `/login` UI — channel toggle + OTP entry
- Clean error handling (delivery failure → 502, not a bare crash)

### Phase 2 — Candidate + Public
- `/` home (about the company), `/contact`
- `/profile` — view/edit details (name, DOB, phone, email, **nationality**), resume upload/replace to Blob (PDF/Word, ≤5 MB), **Aadhaar card upload for verification** (PDF/JPG/PNG, ≤5 MB, `/api/me/aadhaar`)
- `/listing` — live jobs, one-click apply (deduped: one application per job)
- APIs: `/api/me` (GET/PUT), `/api/me/resume`, `/api/jobs` (GET), `/api/applications` (GET/POST)

### Phase 3 & 4 — Admin
- `/admin` with tabs: **Candidates** (keyset-paginated, resume links), **Applications**, **Jobs**, **Admins**
- Job CRUD: post, list, soft-close (`/api/jobs`, `/api/jobs/[id]`)
- **Application review** — change status: applied → reviewed → shortlisted → rejected (`/api/admin/applications`, `[id]` PATCH)
- **Contact candidates** — email a candidate from a modal (`/api/admin/contact`, via Resend)
- **Candidate CSV export** — "Download CSV" on the Candidates tab (`/api/admin/candidates/export`, admin-gated)
- **Admin management** — any admin can promote another by email; seeded `neevbridgeconsultancy@gmail.com` is the first admin (`/api/admin/admins`)
- Admins log in through the same OTP flow; role gates `/admin`

### Sign-in role selector + verification fields
- Login page has a **User / Admin** toggle; picking Admin shows a disclaimer ("restricted to authorized personnel") and routes to `/admin` after verify. Admin is **not** a separate credential — it's a DB role; the real gate stays server-side (middleware blocks non-admins from `/admin`). So user vs admin sign-in use the identical OTP flow; the toggle is routing + disclaimer only.
- Signup collects no form (first OTP verify creates the account); profile details — now including **nationality** and **Aadhaar upload** — are completed on `/profile`.
- Schema: `User.nationality`, `User.aadhaarBlobUrl` (migration `1_add_nationality_aadhaar`, applied via `prisma migrate deploy` in the Vercel build).

### Free-tier hardening
- Phone login gated behind Twilio config: API rejects phone OTP cleanly when Twilio is unset; login UI hides the channel toggle (email-only) unless `NEXT_PUBLIC_PHONE_LOGIN_ENABLED=1`. No "no provider" crash for users.

### Frontend revamp (Frontend-Plan.md) — green/white brand
- **Phase 1** ✅ Brand tokens retheme (white ground, logo green, navy ink), logo in header/footer + favicon
- **Phase 2** ✅ Animated home — GSAP ScrollTrigger (bridge draw-on, reveals, count-up stats), reduced-motion gated
- **Phase 3** ✅ Jobs (`/listing`) search + field filter + structured cards; Applications (`/applications`) status summary + dot cards
- **Phase 4** ✅ Profile (initials avatar header, grouped personal/documents sections, upload status chips) + Contact (refined two-card layout) — both migrated off legacy neutral/blue classes
- **Phase 5** ⏳ Responsive/perf/a11y pass (mobile hamburger nav, `next/image`, Lighthouse ≥90)

### Design system
- Brand tokens (light/dark), Inter + Sora fonts
- Sticky header + footer across all pages
- Reusable `.card` / `.btn` / `.input` / `.badge` / `.link` component classes

### Infrastructure
- GitHub auth + all commits pushed to `SaniN30/Portal_NBC`
- Vercel project linked, `JWT_SECRET` + Neon + Blob env set (sensitive)
- Production deploys via Vercel CLI

---

## 🔧 Pending — needs your accounts (not code)

1. **Resend domain verification** — verify a domain at resend.com/domains and set `OTP_FROM_EMAIL` to `@yourdomain`. Until then, test mode only delivers to `nautiyalsanidhya30@gmail.com`. **Required to serve real users.**
2. **Twilio (optional)** — phone login is **disabled** until configured. To enable: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` **and** `NEXT_PUBLIC_PHONE_LOGIN_ENABLED=1`, then redeploy. Until then the login UI is email-only and the API rejects phone OTP with a clean message (no crash).
3. **Seed production admin** — done for the two test emails; re-run the SQL for any additional admins.
4. **GitHub auto-deploy (optional)** — connect the repo in Vercel → Settings → Git for push-to-deploy (currently deploying via CLI).

## 🚧 Pending — engineering follow-ups

1. **Resume privacy hardening** — resumes are `public` Blob URLs with unguessable paths; upgrade to private + signed download URLs for strict PII gating. *(flagged with a `ponytail:` comment in `src/app/api/me/resume/route.ts`)*
2. **Design polish — remaining surfaces** — profile ✅ and contact ✅ now on brand tokens (Phase 4). Admin sub-tabs still use baseline neutral styling; Phase 5 covers the responsive/a11y/perf pass.
3. ~~**Candidate applications page**~~ — ✅ built: `/applications` lists a candidate's applications with status badges (applied/reviewed/shortlisted/rejected); linked in header nav.
4. **Tests** — unit self-check exists for OTP logic; integration + E2E (login→apply, admin→post-job) and the 80% coverage target from the plan are not yet built.
5. **Rate limiting** beyond OTP — per-IP limits on other endpoints not yet added.
6. **`db:seed` script** — reads `SEED_ADMIN_EMAIL`; needs a non-sensitive DB URL locally, so admins are currently seeded via the Neon SQL console instead.

---

## Known ceilings (deliberate, documented)
- Resume storage: public-unguessable, not signed-private (see above).
- **Aadhaar storage: hardened** — stored in **private** Blob (no public URL); viewable only by streaming through auth-checked routes (`/api/me/aadhaar` for self, `/api/admin/aadhaar/[userId]` for admins). Resumes are still public-unguessable — apply the same treatment if resume PII must be gated too.
- Admin model is **flat** — any admin can add/remove admins (matches "admin team gets all rights" in Idea.md). No super-admin tier.
- OTP is self-hosted (not Twilio Verify) so email + phone share one verify path.
