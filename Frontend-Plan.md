# Frontend Revamp — Implementation & Execution Plan

Source: `Frontend.md`. Brand: white background + logo green (`#1e8a4f`), navy (`#0d2149`) as text/secondary. Logo = `Gemini_Generated_Image_zgqtcnzgqtcnzgqt.png`.

## Scope decision (ponytail)
The brief says "highly animated … 3D … scroll-trigger throughout." Read literally that's WebGL on a job-consultancy site — heavy bundle, mobile battery, a11y risk, for little payoff. So:
- **Heavy animation lives on the HOME page only** (the one page whose job is to impress).
- **Jobs / Applications / Contact / Profile** asked for "organised, structured, refined" — that's **layout + hierarchy + light motion**, NOT 3D. Treat them as polish, not spectacle.
- **GSAP ScrollTrigger + CSS** delivers ~90% of the "highly animated" feel, mobile-safe. **Three.js/R3F skipped by default.** → add when: you explicitly want a WebGL hero centerpiece (say so and it becomes Phase 2b).
- Every animation gated behind `prefers-reduced-motion` (accessibility, non-negotiable).

Reuse what exists: CSS-var design system (`globals.css`), `.card/.btn/.input/.badge`, `SiteChrome`, `/applications` + all APIs. This is a **reskin + restructure**, not a rebuild.

---

## Implementation plan (what changes, by area)

**Design foundation**
- Retheme tokens in `globals.css`: `--bg:#ffffff`, green `--brand`, navy as `--text`/secondary accent. One edit → propagates to every page.
- Logo: export a clean SVG (or use PNG via `next/image`) → replace the "NB" box in `SiteChrome`. Add favicon from logo.
- Fonts: keep Inter (body) + Sora (display). Optional serif for hero headings to echo the wordmark — deferred.

**Home (`/`) — the animated page**
- Sections: hero (logo + tagline "Connecting Vision · Building Solutions · Driving Growth"), what-we-do, stats, how-it-works, CTA.
- GSAP ScrollTrigger: fade/slide-in on scroll, pinned section, animated counters, SVG bridge draw-on. CSS for hovers/gradients.

**Jobs (`/listing`)** — filter/search bar, structured job cards (title, field, location, type), clearer Apply state, empty state.

**Applications (`/applications`)** — already built; restructure into a cleaner status timeline/grid, keep the badges.

**Contact (`/contact`)** — refined layout, company info + form alignment, validation states.

**Profile (`/profile`)** — reframe as a real profile: avatar/initials header, grouped sections (personal / documents / nationality), the resume + private-Aadhaar controls already there.

**Responsive + perf** — mobile-first pass on all pages; nav → hamburger on mobile; images via `next/image`; Lighthouse check.

---

## Execution plan (phase-wise, shippable each phase)

| Phase | Deliverable | Depends on |
|---|---|---|
| **0 — Load skills** | Load `ui-ux-pro-max`, `frontend-design`, `gsap-scrolltrigger`, ECC frontend skills before building | — |
| **1 — Brand foundation** | Green/white token reskin + logo SVG in header/footer + favicon. Every page instantly on-brand. Ship. | 0 |
| **2 — Home (animated)** | Rebuild `/` with GSAP ScrollTrigger sections. Reduced-motion fallback. Ship. | 1 |
| **2b — (optional) 3D hero** | WebGL/R3F bridge centerpiece — only if you ask | 2 |
| **3 — Jobs + Applications** | Restructure `/listing` (search/filter, cards) and `/applications` (status layout). Ship. | 1 |
| **4 — Contact + Profile** | Refine `/contact`; rebuild `/profile` as structured profile. Ship. | 1 |
| **5 — Responsive + perf + a11y** | Mobile pass all pages, hamburger nav, `next/image`, Lighthouse ≥90. Ship. | 2–4 |

Each phase is independently deployable (same commit→push→`vercel --prod` flow). Order after Phase 1 is flexible — 3/4 can swap.

---

## Recommendation
Start **Phase 1** (token reskin + logo) — one commit, whole site turns green/white, immediate visible win, low risk. Then Phase 2 (home). Decide on 2b (real 3D) only after seeing the GSAP home.
