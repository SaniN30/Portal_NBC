# Issues — Neev Bridge Consultancy Job Portal

Incomplete work and planned builds. Grouped by blocker type; ordered roughly by priority within each group.
**Last updated:** 2026-07-28

---

## 🔴 Open bugs / investigations

- [ ] **`/profile` & `/admin` "not loading" — awaiting evidence.** Both pages hang on "Loading…" until `/api/me` resolves. Root-cause guard shipped: `api()` now aborts stalled requests at 20s (`src/lib/client.ts`, commit `18977fe`). Server + public DB path verified healthy; the authenticated `/api/me` → DB path could not be reproduced remotely (Vercel `JWT_SECRET` is write-only). **Next:** hard-refresh `/profile`, check DevTools Network for a stuck `/api/me` request + any Console error, then chase from there.
- [x] **Profile hides staff console link for non-`admin` roles.** Fixed: `src/app/profile/page.tsx` now gates the Admin link + "Staff" badge on `role !== "candidate"`.
- [x] **Admin sub-tabs swallow fetch errors.** Fixed: `Candidates` and `Jobs` loads in `src/app/admin/page.tsx` now `.catch` and surface the message like the other tabs.

---

## 🟠 Needs your accounts (not code)

- [ ] **Resend domain verification** — verify a domain at resend.com/domains, set `OTP_FROM_EMAIL` to `@yourdomain`. Until then email OTP only delivers to `nautiyalsanidhya30@gmail.com`. **Required to serve real users.**
- [ ] **Twilio (optional)** — phone login disabled until `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` **and** `NEXT_PUBLIC_PHONE_LOGIN_ENABLED=1` are set, then redeploy.
- [ ] **GitHub auto-deploy (optional)** — connect the repo in Vercel → Settings → Git for push-to-deploy (currently deploying via CLI).

---

## 🟡 Data migration

- [ ] **Neon → Supabase data not carried over.** Production DB switched to Supabase fresh (only super_admin seeded); any candidates/applications created on Neon were left behind. If that data is still needed: `pg_dump` from Neon → restore into Supabase. Otherwise close this.

---

## 🔵 Engineering follow-ups

- [ ] **Tests** — only an OTP unit self-check + an `auth.ts` RBAC self-check exist. Integration + E2E (login→apply, staff→post-job, super_admin→assign-role) and the 80% coverage target are not built.
- [ ] **Resume privacy hardening** — resumes are `public` Blob URLs with unguessable paths; upgrade to private + signed download URLs for strict PII gating. (Aadhaar already private-streamed.) Flagged with a `ponytail:` comment in `src/app/api/me/resume/route.ts`.
- [ ] **Rate limiting beyond OTP** — per-IP limits exist only on OTP request; other endpoints have none.
- [ ] **`db:seed` script** — reads `SEED_ADMIN_EMAIL`; needs a non-sensitive local DB URL. Admins currently seeded via SQL / migration instead.
- [ ] **CSV export scale** — `/api/admin/candidates/export` loads all rows in one query (fine to ~tens of thousands). Switch to cursor-paged streaming past that. `ponytail:` comment in the route.

---

## 🟢 Design / frontend

- [ ] **Frontend Phase 5** — responsive/perf/a11y pass: mobile hamburger nav polish, `next/image` audit, Lighthouse ≥90.
- [ ] **Admin sub-tabs on brand tokens** — the staff console still uses baseline neutral styling (inline `field`/`btn` classes) instead of the `.card`/`.input`/`.btn` design-system classes used elsewhere.

---

## ✅ Recently completed (2026-07-28)

- RBAC — candidate/recruiter/hiring_manager/admin/super_admin, rank-based guards, super_admin-only role assignment
- Production DB migrated Neon → Supabase (pooled runtime, session-pooler migrations)
- Deploy build-command fix (`prisma migrate deploy` over `DIRECT_URL` — stopped the pooler-migrate hangs)
- Light-theme invisible-font fix (`--muted` was near-white)
- `api()` 20s timeout (prevents indefinite "Loading…" hangs)
