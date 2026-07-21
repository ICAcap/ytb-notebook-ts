# YTB Notebook — Product & Codebase Assessment (2026-07-09, revised 2026-07-17)

A from-the-code read of where this project stands, whether it's deployable, what to build next, and what to use for a showcase homepage. Based on direct inspection of the repo (schema, data layer, auth, components, git history) plus research on what gets developers hired in 2026.

> This assessment was originally written in June 2026 and re-verified four times since (2026-07-08, 2026-07-09, 2026-07-17, 2026-07-20). Earlier drafts tracked corrections as a bolted-on addendum; this version folds everything into one current read so it doesn't contradict itself mid-document.

---

## TL;DR

- **Architecturally solid.** Auth, data isolation, schema design, and Next.js App Router usage are all done correctly — not "tutorial-quality."
- **Two of the original blockers are closed**: the exposed `/tiptap` dev route is deleted, and `.env.example` now documents every required credential.
- **Two real features shipped since the original draft**: authenticated, XSS-hardened PDF export (single note + whole-video) backed by a cached warm Puppeteer instance, and — new as of 2026-07-17 — **full-text search across note content**, not just video titles (see §1 and §4). Both are genuinely good systems-design talking points.
- **Rate limiting is now fully closed.** All four write/fetch surfaces are backed by Upstash Redis (`@upstash/ratelimit`, `utils/ratelimiter.ts`), keyed per-`userId` with prefix-isolated instances: PDF export (`pdfExportRatelimit`: 5 req/10s) and the shared-key YouTube title fetch (`youtubeRatelimit`: 10 req/60s) were closed first; note creation/update (`noteWriteRateLimit`: 30 req/60s) and video add/edit (`videoWriteRateLimit`: 10 req/60s) closed 2026-07-20. Each fails closed — a rejected `.limit(userId)` returns `null`/`429` before the expensive render, external API call, or DB write happens. The title-fetch path also surfaces a toast on failure instead of silently leaving the title field blank; the note/video write paths already had generic "Submission Failed" toasts on any `null` return, so no new UI work was needed there.
- `README.md` is still `create-next-app` boilerplate — cheap but no longer purely a "blocker" framing, see below. A root `global-error.tsx` boundary is implemented; the dead `screenshotUrl` schema field has been removed; security headers are set in `next.config.ts`; `LICENSE` (MIT) has been added.
- **Remaining effort to "launchable as a resume portfolio piece": ~1 focused day**, no architecture changes required.

---

## 1. What's Already Strong (worth saying out loud in an interview)

- **Every query is scoped by `userId`.** `lib/dbTableAction/noteTableAction.ts`, `videoTableAction.ts`, and `collectionTableActions.ts` all filter/update/delete by `userId` + record id together — this is the actual fix for IDOR bugs, not an afterthought. Most side projects get this wrong.
- **Real Next.js App Router patterns**: server components fetch data directly (`src/app/videos/page.tsx`), search/pagination work via a plain `GET` form (works without JS, bookmarkable, no client-side fetch waterfall), `Suspense` boundaries are in the right places.
- **Auth done properly**: better-auth + Google OAuth + Prisma adapter, session cookie caching configured, `requireSession()` wrapped in React's `cache()` so it's not re-fetched per component.
- **Schema reflects actual query patterns**: composite uniqueness (`[userId, youtubeVidID]`, `[userId, collectionName]`), indexes on `userId` and `userId+createdAt` specifically because those are the lookup paths used — this isn't `@@index` cargo-culting.
- **Note content stored as structured Tiptap JSON, not raw HTML** — avoids stored-XSS by construction; rendering uses `@tiptap/static-renderer`'s `renderToReactElement`/`renderToHTMLString` rather than `dangerouslySetInnerHTML`.
- **Playback UX is genuinely thought through**: throttled (750ms) + debounced position saves, resume-from-`lastPlayedTime`, auto-scroll-pause-while-editing — small details that separate "I followed a tutorial" from "I used this myself and fixed what annoyed me."
- **PDF export (new since June draft, commits `f730ad3`…`4dbfcf5`)**: two authenticated routes (`src/app/api/notes/[noteId]/pdf`, `src/app/api/notes/video/[videoId]/pdf`), both call `requireSession()` and scope by `userId`. `lib/puppeteerBrowser.ts` caches a **warm Puppeteer `Browser` on `globalThis`, keyed by the launch Promise** (not the resolved value), so concurrent requests await one in-flight launch instead of racing separate `puppeteer.launch()` calls, with auto-recovery on `disconnected`. `escapeHtml()` sanitizes the video title before it's interpolated into the HTML passed to `page.setContent()`, and `setJavaScriptEnabled(false)` closes the obvious stored-XSS/SSRF vector. This is a substantive, interview-ready systems-design answer: "shared warm-process pool for an expensive external resource, promise-based dedup to avoid a launch race, XSS hardening on the render path."
- **Full-text note content search (new since 2026-07-09 draft, ~8 commits, 2026-07-12 → 2026-07-17)**: this was the top item in the "Feature Additions Worth Considering" list in the prior draft, and it's now built and working — not a stub. `prisma/schema.prisma` adds `Note.contentText String @default("") @db.Text` (Tiptap JSON flattened to plain text via `utils/tiptapToText.ts`) plus `@@index([userId, contentText])`; `createNote()`/`updateNote()` in `lib/dbTableAction/noteTableAction.ts` keep it in sync on every write. `getNotesWithSearchParam(userId, page, pageSize, query, collection, color)` filters on `contentText: { contains: query, mode: "insensitive" }` with optional collection/color filters — a real content match, not a title-only search dressed up. The UI lives at `src/app/notes/page.tsx` (`NoteSearchPage`), driven by `src/app/notes/_components/NoteSearchBar.tsx` via URL search params, with results grouped by video into an alphabetical accordion (`NoteListItem` per note) and a `startAt` param that jumps `VideoPlayer` straight to the matched timestamp. That last part — search result → exact playback position — is a nice end-to-end UX detail worth mentioning in an interview, not just "we added a search box."
- **19+ migrations across ~5 weeks** of steady, incremental schema evolution (renames, index additions, cascade-rule fixes) — real iteration, not a single big-bang commit.

---

## 2. Blockers Before Calling This "MVP Deployable"

**Closed:**
1. ~~`/tiptap` exposed, unauthenticated dev route~~ — deleted (`git log`: "remove test tiptap page"). No `src/app/tiptap` directory exists.
2. ~~No `.env.example`~~ — exists at repo root, documents all required vars with comments on where to get each credential (`TEST_USER_ID`/`TEST_VID_ID` are seed-script-only, correctly omitted).

**Closed since last pass:**
- ~~No `error.tsx`/`global-error.tsx`~~ — `src/app/global-error.tsx` now implements a DaisyUI-themed fallback with a `reset()`-wired retry button, closing the root-level error-boundary gap. A per-segment `error.tsx` (e.g. for `/videos`) is still optional polish, not required.
- ~~`screenshotUrl` dead field~~ — removed from `prisma/schema.prisma`, `NoteCreation`/`NoteUpdate` types, `NoteCard`, `EditableNoteForm`, and `NoteContainer`, with a migration dropping the column.
- ~~No security headers~~ — `next.config.ts` now sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin` on all routes via `headers()`. `Content-Security-Policy`/`Strict-Transport-Security` intentionally left out — CSP needs tuning against real script/style sources or it breaks the app, and HSTS is a no-op pre-deploy (Vercel adds it automatically).
- ~~No `LICENSE`~~ — `LICENSE` added at repo root (MIT).

**Closed since 2026-07-20 pass:**
- ~~PDF export routes unrate-limited~~ — `src/app/api/notes/[noteId]/pdf/route.ts` and `src/app/api/notes/video/[videoId]/pdf/route.ts` both call `requireSession()` then `pdfExportRatelimit.limit(userId)` (Upstash, 5 req/10s, prefix `ratelimit:pdfExport`) before doing any DB fetch or Puppeteer render, returning 429 on failure. This was the top-priority surface — a Puppeteer render is the single most expensive per-request operation in the app.
- ~~`fetchYouTubeTitle()` unrate-limited~~ — now calls `requireSession()` + `youtubeRatelimit.limit(userId)` (Upstash, 10 req/60s, prefix `ratelimit:youtube`, isolated from the PDF limiter) before calling Google's API, protecting the single shared `YOUTUBE_API_KEY`'s 10,000-unit/day quota from a scripted add-video loop. `src/app/videos/_components/AddVideoForm.tsx` now also toasts "Couldn't auto-fetch title, please enter it manually" on any fetch failure (rate-limited, network error, or not-found alike), closing the silent-blank-field gap this created.

- ~~Unbounded note/video creation~~ — `createNote()`/`updateNote()` (`lib/dbTableAction/noteTableAction.ts`) now call `noteWriteRateLimit.limit(userId)` (Upstash, 30 req/60s, prefix `ratelimit:note-write`) before the DB write; `upsertYouTubeVideo()` (`lib/dbTableAction/videoTableAction.ts`, backs both add-video and edit-video) calls `videoWriteRateLimit.limit(userId)` (10 req/60s, prefix `ratelimit:video-write`). Both fail closed by returning `null`, matching each function's existing failure-return convention — the three calling forms (`EditableNoteForm.tsx`, `AddVideoForm.tsx`, `EditVideoForm.tsx`) already had generic `toast.error(...)` on a `null` return, so no new UI work was needed. Windows are looser (60s) than the PDF/YouTube limiters since these are plain DB writes, not expensive external calls, and shouldn't interrupt normal editing bursts.

**Still open:**
1. **`README.md` is still the unmodified `create-next-app` boilerplate.** For a public repo this is the first thing a hiring manager sees. Still the single highest-leverage item for portfolio presentation. (`robots.ts`/`sitemap.ts` remain a no-op until a public route — e.g. the Tier 1 share link — actually exists. See Tier 4 in Section 4.)

None of these require touching the data model or architecture. This is a polish pass, not a rebuild.

---

## 3. So — Is It "MVP Deployable" in the 2026 Market?

Two different questions hide in that one:

**(a) Deployable as a real product, for real users?** Architecturally yes — auth and data isolation are correct. All rate-limiting gaps (PDF export, YouTube title fetch, note/video creation) are now closed as of 2026-07-20.

**(b) Deployable as a portfolio piece to land a job right now?** Per current hiring-manager research ([sources below](#sources)): the bar in 2026 is a small number (2–3) of *polished, deployed* projects with a strong README and visible architecture — not a pile of unfinished repos, and explicitly *not* another tutorial clone (to-do apps, weather apps, Netflix clones are specifically called out as not moving the needle). 84% of employers reportedly want to see a working, live app, not just source.

This project already clears the hardest bar — it's not a tutorial clone, and the architecture is real. What's still failing is the cheap part: *deployed, documented, demoable without your Google login.* Recommend proceeding to launch, in this order:
1. ~~Basic rate limiting on the PDF/YouTube-title routes, plus note/video creation~~ — done (Upstash + `@upstash/ratelimit`, see §2). All four surfaces closed.
2. Rewrite `README.md`.
3. Deploy to Vercel + Neon per the checklist in Section 6.
4. Everything in Section 4 (share links, showcase homepage) is additive polish, not a blocker — ship after the live link exists.

---

## 4. Feature Additions Worth Considering

**Tier 1 — cheap, finishes the product, directly serves the "demoable" gap above:**
- ~~**Search across note *content***, not just video titles~~ — **shipped 2026-07-17.** `src/app/notes/page.tsx` + `getNotesWithSearchParam()` (`lib/dbTableAction/noteTableAction.ts`) do real `contentText` matching (Prisma `contains`, case-insensitive) against a flattened-Tiptap field kept in sync on every note write, with collection/color filters and jump-to-timestamp playback. See §1.
- **Public, read-only share link** for a single Video+Notes or a whole Collection. Right now the only way to show this to anyone is to hand them your Google account — confirmed no such feature exists yet. With content search now done, this is the single highest-leverage item left on the whole list for "is this deployable as a demo."
- **Export notes** — already shipped as PDF; Markdown export would be a cheap addition on top of the existing Tiptap-JSON-to-plain-text path — and that path (`utils/tiptapToText.ts`) now already exists as a side effect of building content search, so this is cheaper than it was in the last draft.

**Tier 2 — medium effort, meaningfully different surface area:**
- A **collection-level notebook view** — notes aggregated across every video in a collection, not just per-video.
- A **tagging system** orthogonal to collections (many-to-many), with filtering by tag/color (color already exists on notes — filtering by it doesn't yet).
- A **bookmarklet or tiny browser extension**: "send this YouTube tab to YTB Notebook." Exactly the kind of "solves a real, specific, personal problem" project 2026 hiring research flags as standing out — more than the core app does on its own, because it's a clear before/after story.

**Tier 3 — optional, for the "AI fluency" signal current hiring research calls out:**
- Auto-summarize a video's notes into a short recap (LLM call over the Tiptap content already stored) — a scoped, product-native AI feature, not a bolted-on chatbot.
- Caption-based note-start suggestions (pull YouTube transcripts, suggest timestamps).
- Treat both as genuinely optional — don't add AI just to check a box; add it if it's the actual next thing that makes the product better.

**Tier 4 — operational, not user-facing:**
- `robots.txt`/sitemap + OG images — pointless today (no public route exists to crawl), worth adding once the Tier 1 share link ships.
- Self-hosted analytics (see below) to know if the live demo is actually being looked at.
- Error tracking so a recruiter's edge-case click doesn't just silently white-screen.

---

## 5. Building the Showcase Homepage

The stack already in place — Next.js 16 + Tailwind v4 + DaisyUI — is enough; no need for a separate static site generator. `src/app/page.tsx` already exists as the `/` route, it's just currently one `<h1>` and a sign-in form.

**Recommended, in order:**

1. **[Cruip's "Open" template](https://github.com/cruip/open-react-template)** — free, Next.js + Tailwind v4, built specifically to "showcase open source projects, SaaS products, and online services." Closest match to this exact use case.
2. **[ixartz/Next-JS-Landing-Page-Starter-Template](https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template)** — Next.js + TypeScript + Tailwind + ESLint + Prettier preconfigured. Heavier dev-experience scaffold; good if cherry-picking sections into a clean structure.
3. **Component-level (lighter touch)**: HyperUI or Flowbite's free Tailwind blocks — copy individual hero/feature/footer sections directly rather than adopting a whole template's layout, so it doesn't fight the DaisyUI theming (`cmyk`/`dark`) already driving the rest of the app.

**Practical recommendation:** don't import a full template wholesale. Pull 3–4 individual sections — hero with a real screenshot/GIF of notes-on-video in action (the most differentiated thing this product does), a 3-icon feature row (timestamped notes / collections / resume playback), and a footer with "Live Demo" + "View Source" buttons — and re-skin them with the existing DaisyUI tokens so the landing page matches the app instead of looking like a different product bolted onto it.

---

## 6. Free/OSS Tooling Checklist for Going Live

| Need | Recommendation | Why |
|---|---|---|
| Hosting | Vercel free tier | Native Next.js support, zero-config |
| Database | Neon free tier (already implied by `prisma.config.ts`/seed setup) | Serverless Postgres, generous free tier |
| Analytics | [Umami](https://umami.is/) (MIT, self-host free) or Plausible Community Edition (AGPL) | Privacy-first, no cookie-banner obligation, unlike GA |
| Error tracking | Sentry free tier (5k events/mo) | Wire into the existing `global-error.tsx` (and any future per-segment `error.tsx`) |
| CI | GitHub Actions (free for public repos) | Lint + build (+ tests later) on every push |
| Uptime | UptimeRobot or Better Stack free tier | So the demo link isn't dead the one time someone checks it |

---

## 7. Suggested Order of Operations

1. ~~Half day: basic per-user rate limiting on the PDF export routes, the YouTube title fetch, and note/video creation~~ — done 2026-07-20 (Upstash Redis, `utils/ratelimiter.ts`, four prefix-isolated per-surface limiters keyed on `userId`).
2. **Half day**: rewrite `README.md` with screenshots + a short architecture section, including the note-content-search feature and its search→timestamp-jump UX — it's now one of the more differentiated things in the app and should be shown, not just PDF export. (`LICENSE` already added — MIT.)
3. **Half day**: deploy to Vercel + Neon, smoke-test the golden path end to end on the live URL.
4. **1 day**: build the showcase homepage from the template/section sources above.
5. **1 day**: ship the public read-only share link (Tier 1 feature) — now the single highest-leverage item on the whole list, because it turns "trust me, it works" into something a hiring manager can click. Content search being done removes the only other Tier 1 competitor for this slot.
6. After that: pick one Tier 2/3 feature that's genuinely interesting to build, not the one that looks best on paper — genuine depth reads better than checklist completeness.

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
