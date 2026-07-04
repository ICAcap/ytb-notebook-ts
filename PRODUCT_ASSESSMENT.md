# YTB Notebook — Product & Codebase Assessment (June 2026)

A from-the-code read of where this project stands, whether it's deployable, what to build next, and what to use for a showcase homepage. Based on direct inspection of the repo (schema, data layer, auth, components, git history) plus current research on what gets developers hired in 2026.

---

## TL;DR

- **Architecturally solid.** Auth, data isolation, schema design, and Next.js App Router usage are all done correctly — not "tutorial-quality."
- **Not yet deployable to the public** — five concrete, cheap-to-fix blockers below (leftover dev route exposed, no `.env.example`, no rate limiting, dead feature surface, no README worth showing a stranger).
- **As a portfolio piece**, the gap between "what this is" and "what gets you interviews" is mostly *presentation* (README, live demo, landing page), not more engineering. That's the highest-leverage work available right now.
- Estimated effort to close every blocker below: **3–4 focused days**, no architecture changes required.

---

## 1. What's Already Strong (worth saying out loud in an interview)

- **Every query is scoped by `userId`.** `lib/dbTableAction/noteTableAction.ts`, `videoTableAction.ts`, and `collectionTableActions.ts` all filter/update/delete by `userId` + record id together — this is the actual fix for IDOR bugs, not an afterthought. Worth calling out explicitly; most side projects get this wrong.
- **Real Next.js App Router patterns**: server components fetch data directly (`src/app/videos/page.tsx`), search/pagination work via a plain `GET` form (works without JS, bookmarkable, no client-side fetch waterfall), `Suspense` boundaries are in the right places.
- **Auth done properly**: better-auth + Google OAuth + Prisma adapter, session cookie caching configured, `requireSession()` wrapped in React's `cache()` so it's not re-fetched per component.
- **Schema reflects actual query patterns**: composite uniqueness (`[userId, youtubeVidID]`, `[userId, collectionName]`), indexes on `userId` and `userId+createdAt` specifically because those are the lookup paths used — this isn't `@@index` cargo-culting.
- **Note content stored as structured Tiptap JSON, not raw HTML** — this avoids stored-XSS by construction, and rendering uses `@tiptap/static-renderer`'s `renderToReactElement` rather than `dangerouslySetInnerHTML`. Good instinct, whether or not it was deliberate.
- **Playback UX is genuinely thought through**: throttled (750ms) + debounced position saves, resume-from-`lastPlayedTime`, and a just-shipped auto-scroll-pause-while-editing feature (per recent commits) — small details that separate "I followed a tutorial" from "I used this myself and fixed what annoyed me."
- **19 migrations across ~5 weeks** of steady, incremental schema evolution (renames, index additions, cascade-rule fixes) — shows real iteration, not a single big-bang commit.

---

## 2. Blockers Before Calling This "MVP Deployable"

1. **`/tiptap` is a live, unauthenticated route in production.** [src/app/tiptap/page.tsx](src/app/tiptap/page.tsx) is a dev scratch page (renders a hardcoded sample note) with no `requireSession()` call — it's reachable by anyone who finds the URL. Delete it or gate it.
2. **No `.env.example`.** The app needs 9 env vars (`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `YOUTUBE_API_KEY`, `TEST_USER_ID`, `TEST_VID_ID`) and none are documented anywhere. Anyone cloning this repo — including a recruiter trying to run it, or you on a new machine — is stuck. Five-minute fix.
3. **README.md is still the unmodified `create-next-app` boilerplate.** For a public repo this is the first thing a hiring manager sees, and right now it says nothing about what the product does.
4. **No rate limiting anywhere.** `fetchYouTubeTitle()` ([utils/youtubeFetchTitleServerSide.ts](utils/youtubeFetchTitleServerSide.ts)) shares one `YOUTUBE_API_KEY` across every user of the deployed app, against Google's free 10,000-unit/day quota. A handful of enthusiastic users (or one bot hitting "Add Video" in a loop) exhausts it for everyone, with no backoff beyond `cache: "force-cache"`. Same exposure on unbounded note/video creation. This is a cost/availability risk specifically *because* the app is meant to go public — fix before opening sign-ups.
5. **`screenshotUrl` is a dead field.** It's in the Prisma schema, the `NoteCreation`/`NoteUpdate` types, `NoteCard`, and `EditableNoteForm` — but nothing in the codebase ever sets it (no upload route, no capture UI). Either wire up real screenshot capture or remove the field; a half-finished feature surface reads worse in review than no feature at all.
6. No `error.tsx`/`global-error.tsx`, no security headers (`next.config.ts` has no `headers()`), no `LICENSE`, no `robots.txt`/sitemap.

None of these require touching the data model or the architecture. This is a polish pass, not a rebuild.

---

## 3. So — Is It "MVP Deployable" in the 2026 Market?

Two different questions hide in that one:

**(a) Deployable as a real product, for real users?** Architecturally yes — auth and data isolation are correct. Mechanically, not until #1 and #4 above are closed (an exposed dev route and an unmetered shared API key are the kind of thing that turns into an incident, not just tech debt).

**(b) Deployable as a portfolio piece to land a job right now?** Per current hiring-manager research ([sources below](#sources)): the bar in 2026 is a small number (2–3) of *polished, deployed* projects with a strong README and visible architecture — not a pile of unfinished repos, and explicitly *not* another tutorial clone (to-do apps, weather apps, Netflix clones are specifically called out as not moving the needle). 84% of employers reportedly want to see a working, live app, not just source.

This project already clears the hardest bar — it's not a tutorial clone, and the architecture is real. What it's currently failing on is the cheap part: *deployed, documented, demoable without your Google login.* That's a few days of work, and it's worth more right now than any new feature.

---

## 4. Feature Additions Worth Considering

**Tier 1 — cheap, finishes the product, directly serves the "demoable" gap above:**
- **Public, read-only share link** for a single Video+Notes or a whole Collection. Right now the only way to show this to anyone is to hand them your Google account. This single feature does more for "is this deployable as a demo" than anything else on this list.
- **Search across note *content***, not just video titles — Tiptap JSON can be flattened to plain text and matched; currently only titles are searchable.
- **Export notes** (Markdown or PDF) per video/collection.
- Confirm `EditVideoForm` is fully wired — it *is* (used from `VideoCard.tsx`), even though `CLAUDE.md` currently describes it as "a stub, not yet implemented." Worth a one-line update there; the docs have fallen behind the code.

**Tier 2 — medium effort, meaningfully different surface area:**
- A **collection-level notebook view** — notes aggregated across every video in a collection, not just per-video.
- A **tagging system** orthogonal to collections (many-to-many), with filtering by tag/color (color already exists on notes — filtering by it doesn't yet).
- A **bookmarklet or tiny browser extension**: "send this YouTube tab to YTB Notebook." This is exactly the kind of "solves a real, specific, personal problem" project the 2026 research flags as standing out — more than the core app does on its own, because it's a clear before/after story.

**Tier 3 — optional, for the "AI fluency" signal current hiring research calls out:**
- Auto-summarize a video's notes into a short recap (LLM call over the Tiptap content you already store) — a scoped, product-native AI feature, not a bolted-on chatbot.
- Caption-based note-start suggestions (pull YouTube transcripts, suggest timestamps).
- Treat both as genuinely optional — don't add AI just to check a box; add it if it's the actual next thing that makes the product better.

**Tier 4 — operational, not user-facing:**
- `robots.txt`/sitemap + OG images once a public share feature exists.
- Self-hosted analytics (see below) to know if the live demo is actually being looked at.
- Error tracking so a recruiter's edge-case click doesn't just silently white-screen.

---

## 5. Building the Showcase Homepage

The stack already in place — Next.js 16 + Tailwind v4 + DaisyUI — is enough; no need for a separate static site generator. `src/app/page.tsx` already exists as the `/` route, it's just currently one `<h1>` and a sign-in form.

**Recommended, in order:**

1. **[Cruip's "Open" template](https://github.com/cruip/open-react-template)** — free, Next.js + Tailwind v4, built specifically to "showcase open source projects, SaaS products, and online services." Closest match to this exact use case.
2. **[ixartz/Next-JS-Landing-Page-Starter-Template](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template)** — Next.js + TypeScript + Tailwind + ESLint + Prettier preconfigured. Heavier dev-experience scaffold; good if cherry-picking sections into a clean structure.
3. **Component-level (lighter touch)**: HyperUI or Flowbite's free Tailwind blocks — copy individual hero/feature/footer sections directly rather than adopting a whole template's layout, so it doesn't fight the DaisyUI theming (`cmyk`/`night`) already driving the rest of the app.

**Practical recommendation:** don't import a full template wholesale. Pull 3–4 individual sections — hero with a real screenshot/GIF of notes-on-video in action (the most differentiated thing this product does), a 3-icon feature row (timestamped notes / collections / resume playback), and a footer with "Live Demo" + "View Source" buttons — and re-skin them with the existing DaisyUI tokens so the landing page matches the app instead of looking like a different product bolted onto it.

---

## 6. Free/OSS Tooling Checklist for Going Live

| Need | Recommendation | Why |
|---|---|---|
| Hosting | Vercel free tier | Native Next.js support, zero-config |
| Database | Neon free tier (already implied by `prisma.config.ts`/seed setup) | Serverless Postgres, generous free tier |
| Analytics | [Umami](https://umami.is/) (MIT, self-host free) or Plausible Community Edition (AGPL) | Privacy-first, no cookie-banner obligation, unlike GA |
| Error tracking | Sentry free tier (5k events/mo) | Wire into the currently-missing `error.tsx`/`global-error.tsx` |
| CI | GitHub Actions (free for public repos) | Lint + build (+ tests later) on every push |
| Uptime | UptimeRobot or Better Stack free tier | So the demo link isn't dead the one time someone checks it |

---

## 7. Suggested Order of Operations

1. **Half day**: delete/gate `/tiptap`, add `.env.example`, rewrite `README.md` with screenshots + a short architecture section.
2. **Half day**: basic per-user rate limiting on note/video creation; harden the YouTube title cache.
3. **Half day**: deploy to Vercel + Neon, smoke-test the golden path end to end on the live URL.
4. **1 day**: build the showcase homepage from the template/section sources above.
5. **1 day**: ship the public read-only share link (Tier 1 feature) — this is the single highest-leverage item on the whole list, because it's what turns "trust me, it works" into something a hiring manager can click.
6. After that: pick one Tier 2/3 feature that's genuinely interesting to build, not the one that looks best on paper — the research below is consistent that genuine depth reads better than checklist completeness.

---

## Sources

- [The Portfolio Projects That Actually Get You Hired in 2026 — DEV Community](https://dev.to/devraj_singh7/the-portfolio-projects-that-actually-get-you-hired-in-2026-1l0e)
- [Portfolio Roadmap 2026: 5 Projects That Get Interviews — Medium](https://medium.com/@ashusk_1790/portfolio-roadmap-2026-5-projects-that-get-interviews-ddcb9716b46b)
- [Developer Portfolio Guide 2026 — Hakia](https://hakia.com/skills/building-portfolio/)
- [Side Projects That Impress Hiring Managers in 2026](https://techotlist.com/blogs/job-search/side-projects-that-impress-hiring-managers)
- [Cruip — open-react-template (GitHub)](https://github.com/cruip/open-react-template)
- [ixartz — Next-JS-Landing-Page-Starter-Template (GitHub)](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template)
- [Self-Hosted Web Analytics 2026 — Plausible vs Matomo vs Umami vs OpenPanel](https://openpanel.dev/articles/self-hosted-web-analytics)
- [Umami — Privacy-Focused Web Analytics](https://umami.is/)
- [Plausible Analytics (GitHub)](https://github.com/plausible/analytics)
