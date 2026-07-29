# YTB Notebook — Product & Codebase Assessment (2026-07-09, revised 2026-07-29)

A from-the-code read of where this project stands, whether it's deployable, what to build next, and what to use for a showcase homepage. Based on direct inspection of the repo (schema, data layer, auth, components, git history) plus research on what gets developers hired in 2026.

> This assessment was originally written in June 2026 and re-verified five times since (2026-07-08, 2026-07-09, 2026-07-17, 2026-07-20, 2026-07-29). Earlier drafts tracked corrections as a bolted-on addendum; this version folds everything into one current read so it doesn't contradict itself mid-document.

---

## TL;DR

- **Architecturally solid.** Auth, data isolation, schema design, and Next.js App Router usage are all done correctly — not "tutorial-quality."
- **Two real features shipped since the original draft**: authenticated, XSS-hardened PDF export (single note + whole-video) backed by a cached warm Puppeteer instance, and full-text search across note content, not just video titles (see §1 and §4). Both are genuinely good systems-design talking points.
- **Rate limiting is fully closed.** All four write/fetch surfaces are backed by Upstash Redis (`@upstash/ratelimit`, `utils/ratelimiter.ts`), keyed per-`userId` with prefix-isolated instances: PDF export (`pdfExportRatelimit`: 5 req/10s) and the shared-key YouTube title fetch (`youtubeRatelimit`: 10 req/60s) were closed first; note creation/update (`noteWriteRateLimit`: 30 req/60s) and video add/edit (`videoWriteRateLimit`: 10 req/60s) closed 2026-07-20. Each fails closed — a rejected `.limit(userId)` returns `null`/`429` before the expensive render, external API call, or DB write happens.
- **`README.md` is rewritten** (closed as of this pass) — real project description, feature list, tech stack, setup steps, points to `CLAUDE.md` for architecture depth. No longer boilerplate.
- **The "demoable without your Google login" gap is now closed**, via a different mechanism than originally planned. Instead of a read-only share link (the Tier 1 recommendation in the prior draft), the `add-live-demo` branch ships a full anonymous-auth demo route: `/demo` seeds sample data, a visitor-scoped cookie (`middleware.ts`) tracks anonymous sessions, and `lib/cleanDemoAccounts.ts` expires them after 45 minutes via a Vercel Cron job (`cron/vercel.json`). Landing page also got a real design pass (hero, feature rows, FAQ, CTA, GSAP animations) — no longer "one `<h1>` and a sign-in form." See §1, §4, §5.
- **New blocker surfaced this pass, not previously flagged**: `lib/puppeteerBrowser.ts` uses full `puppeteer` (bundles its own ~300MB Chromium) plus a `globalThis`-pinned warm-browser singleton — a pattern that assumes a long-lived process. This does not survive standard serverless deployment as-is (see §3 and §6 for the Vercel-specific fix). This is the one concrete piece of deploy-target-dependent work left.
- **Remaining effort to "launchable as a resume portfolio piece": ~half a day** — the Puppeteer serverless swap, then deploy.

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
- **Anonymous live-demo flow (new, `add-live-demo` branch)**: `/demo` (`src/app/demo/page.tsx`) seeds a signed-out visitor into a working session via better-auth anonymous auth, backed by pre-baked sample data (`src/app/demo/_data/demoData.ts`). `middleware.ts` sets an httpOnly visitor cookie scoped to `/demo`; `lib/cleanDemoAccounts.ts` deletes anonymous users older than 45 minutes, invoked on a schedule via `cron/vercel.json`. `utils/customHooks/useIsDemoRoute.ts` gates demo-aware UI (e.g. suppressing destructive actions or nudging toward real sign-up). This is a stronger answer to "show me it works" than a static share link would have been — a recruiter gets the actual product, not a read-only snapshot.

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

**Closed since 2026-07-20 pass (this pass):**
- ~~`README.md` still boilerplate~~ — rewritten with real project description, feature list, tech stack, setup steps, and a pointer to `CLAUDE.md` for architecture depth.
- ~~No way to demo without a Google login~~ — closed via the anonymous `/demo` route rather than the originally-planned share link; see §1 and §4.

**Still open:**
1. **`lib/puppeteerBrowser.ts` uses full `puppeteer` + a `globalThis`-pinned warm-browser singleton — not serverless-safe as written.** Full `puppeteer` bundles its own Chromium (~300MB), which exceeds Vercel's function size budget, and the warm-`globalThis` reuse pattern assumes a long-lived process that standard serverless invocations don't guarantee. This is the one piece of deploy-blocking work left, and it's deploy-target-dependent — see §3 and §6 for the fix.
2. `robots.ts`/`sitemap.ts` remain a no-op — low priority now that `/demo` is a real public, crawlable route (previously this was blocked on the Tier 1 share link shipping; that's no longer the gating condition). See Tier 4 in Section 4.

None of these require touching the data model or core architecture. This is a polish + deploy-target-compatibility pass, not a rebuild.

---

## 3. So — Is It "MVP Deployable" in the 2026 Market?

Two different questions hide in that one:

**(a) Deployable as a real product, for real users?** Architecturally yes — auth and data isolation are correct. All rate-limiting gaps (PDF export, YouTube title fetch, note/video creation) are closed as of 2026-07-20. The only remaining item is making the PDF export path serverless-compatible (see §2, §6) — a deploy-target-dependent code change, not an architecture problem.

**(b) Deployable as a portfolio piece to land a job right now?** Per current hiring-manager research ([sources below](#sources)): the bar in 2026 is a small number (2–3) of *polished, deployed* projects with a strong README and visible architecture — not a pile of unfinished repos, and explicitly *not* another tutorial clone (to-do apps, weather apps, Netflix clones are specifically called out as not moving the needle). 84% of employers reportedly want to see a working, live app, not just source.

This project already clears the hardest bar — it's not a tutorial clone, and the architecture is real. What was still failing — *deployed, documented, demoable without your Google login* — is now down to one item: an actual live URL. README is rewritten, the anonymous `/demo` route means anyone can try the real product with zero setup. Recommend proceeding to launch, in this order:
1. ~~Basic rate limiting on the PDF/YouTube-title routes, plus note/video creation~~ — done (Upstash + `@upstash/ratelimit`, see §2). All four surfaces closed.
2. ~~Rewrite `README.md`~~ — done.
3. ~~Ship something that lets a stranger try the app without your Google login~~ — done, via the anonymous `/demo` route (see §1, §4) rather than the originally-planned read-only share link.
4. **Swap Puppeteer to a serverless-compatible build** (`puppeteer-core` + `@sparticuz/chromium`) — the one remaining code change gating deployment. See §6.
5. Deploy to Vercel + Neon per the checklist in Section 6.
6. Everything else in Section 4 (Markdown export, collection-level notebook view, tagging, AI features) is additive polish, not a blocker — ship after the live link exists.

### Vercel vs. AWS vs. EC2

This came up directly and is worth settling explicitly rather than leaving open. Recommendation: **Vercel.**

The rest of the stack is already serverless-native — Neon (serverless Postgres), Upstash Redis (serverless-first), Next.js App Router. `cron/vercel.json` (the demo-account cleanup job) is already written in Vercel's Cron Jobs config format, which is an existing signal in the repo toward this choice, deliberate or not.

The one piece of code that doesn't fit a serverless target as-is is `lib/puppeteerBrowser.ts` (full `puppeteer` + `globalThis` warm-browser singleton, see §2). Concretely, three options:
- **Vercel path**: swap to `puppeteer-core` + `@sparticuz/chromium` (a Lambda/serverless-sized Chromium build). The warm-`globalThis`-singleton pattern still works opportunistically under Vercel Fluid Compute, just isn't guaranteed across cold starts — acceptable for a PDF-export code path that isn't latency-critical. This is a scoped, well-known swap (~1-2 hours of work), not a rewrite.
- **AWS (ECS/Fargate) path**: run as a container so the current Puppeteer code works completely unmodified, with the warm-browser singleton behaving exactly as designed. But this trades a code change for standing up a container image, task definitions, an ALB or equivalent, and replacing `cron/vercel.json` with an EventBridge scheduled rule — real ongoing ops surface for a project whose primary goal right now is a portfolio-piece demo, not production scale.
- **Bare EC2 instance**: also lets `lib/puppeteerBrowser.ts` ship untouched — full `puppeteer` and the `globalThis` warm-singleton both work exactly as designed on a long-running process, no cold starts to worry about. But it's the most ops-heavy of the three: you own OS patching, a process supervisor (pm2/systemd) to keep the app alive and restart on crash, a reverse proxy + TLS (nginx/certbot) that Vercel gives for free, no autoscaling without manually configuring an ASG, and `cron/vercel.json` becomes dead weight — replace with a real cron job or systemd timer. Legitimate if actual infra cost or hands-on ops practice matters more than dev time right now, but it's a bad trade purely for a portfolio-piece demo.

Net: EC2 and AWS containers are both "keep this file untouched" options at the cost of ongoing ops surface (EC2 more so — no managed container orchestration at all); Vercel is the "small, well-trodden code change, zero ops overhead" option. For this project's current goal, Vercel still wins on effort-to-value.

---

## 4. Feature Additions Worth Considering

**Tier 1 — cheap, finishes the product, directly serves the "demoable" gap above:**
- ~~**Search across note *content***, not just video titles~~ — shipped. `src/app/notes/page.tsx` + `getNotesWithSearchParam()` (`lib/dbTableAction/noteTableAction.ts`) do real `contentText` matching (Prisma `contains`, case-insensitive) against a flattened-Tiptap field kept in sync on every note write, with collection/color filters and jump-to-timestamp playback. See §1.
- ~~**Public, read-only share link**~~ — superseded, not shipped as originally scoped. Instead of a static share link, the anonymous `/demo` route (see §1, §4-note-below) gives a stranger the *actual product* — full interactivity, not a read-only view — with zero setup. Arguably a stronger demo than the original plan, though it means there's still no way to share one specific video/collection with someone (e.g. "check out these notes I took"). If that specific use case comes up, a read-only share link is still worth revisiting as a distinct feature, not a demo-access workaround.
- **Export notes** — already shipped as PDF; Markdown export would be a cheap addition on top of the existing Tiptap-JSON-to-plain-text path (`utils/tiptapToText.ts`), which already exists as a side effect of content search.

**Tier 2 — medium effort, meaningfully different surface area:**
- A **collection-level notebook view** — notes aggregated across every video in a collection, not just per-video.
- A **tagging system** orthogonal to collections (many-to-many), with filtering by tag/color (color already exists on notes — filtering by it doesn't yet).
- A **bookmarklet or tiny browser extension**: "send this YouTube tab to YTB Notebook." Exactly the kind of "solves a real, specific, personal problem" project 2026 hiring research flags as standing out — more than the core app does on its own, because it's a clear before/after story.

**Tier 3 — optional, for the "AI fluency" signal current hiring research calls out:**
- Auto-summarize a video's notes into a short recap (LLM call over the Tiptap content already stored) — a scoped, product-native AI feature, not a bolted-on chatbot.
- Caption-based note-start suggestions (pull YouTube transcripts, suggest timestamps).
- Treat both as genuinely optional — don't add AI just to check a box; add it if it's the actual next thing that makes the product better.

**Tier 4 — operational, not user-facing:**
- `robots.txt`/sitemap + OG images — `/demo` is now a real public route worth being crawlable; low effort, still not done.
- Self-hosted analytics (see below) to know if the live demo is actually being looked at.
- Error tracking so a recruiter's edge-case click doesn't just silently white-screen.

---

## 5. Building the Showcase Homepage

**Closed since last pass.** The prior draft recommended pulling sections from Cruip's Open template or similar; that recommendation is superseded — a real, hand-built landing page shipped instead. `src/app/page.tsx` now has a hero (`HeroBanner.tsx`), feature rows (`FeatureRow.tsx`), an About section, FAQ, CTA (`CtaSection.tsx`), and a footer (`LandingFooter.tsx`), with GSAP-driven animation (commit `5702b19`). The dashboard also got a layout pass (`5ef7a6e`) and now surfaces note counts.

Remaining polish, not blockers:
- A real screenshot/GIF of notes-on-video in the hero, if not already present — worth confirming against the current `HeroBanner.tsx` since a `public/note-ui-example.png` asset exists in the repo.
- A footer/nav "Live Demo" link pointed at `/demo` once deployed, and a "View Source" link to the repo — the connective tissue between the landing page and the anonymous demo route that already exists.

---

## 6. Free/OSS Tooling Checklist for Going Live

| Need | Recommendation | Why |
|---|---|---|
| Hosting | **Vercel free tier** (decision made this pass — see §3) | Native Next.js support, zero-config, already the implicit target (`cron/vercel.json` is written in Vercel Cron format) |
| PDF rendering | `puppeteer-core` + `@sparticuz/chromium` (swap from full `puppeteer` in `lib/puppeteerBrowser.ts`) | Full `puppeteer`'s bundled Chromium is too large for Vercel's function size limit; this is the standard serverless-compatible swap, ~1-2 hours of work |
| Database | Neon free tier (already implied by `prisma.config.ts`/seed setup) | Serverless Postgres, generous free tier |
| Cache/rate-limit | Upstash Redis (already in use, `utils/ratelimiter.ts`) | Already serverless-first, no change needed |
| Scheduled jobs | Vercel Cron (already configured, `cron/vercel.json`) | Backs the demo-account cleanup job; no change needed |
| Analytics | [Umami](https://umami.is/) (MIT, self-host free) or Plausible Community Edition (AGPL) | Privacy-first, no cookie-banner obligation, unlike GA |
| Error tracking | Sentry free tier (5k events/mo) | Wire into the existing `global-error.tsx` (and any future per-segment `error.tsx`) |
| CI | GitHub Actions (free for public repos) | Lint + build (+ tests later) on every push |
| Uptime | UptimeRobot or Better Stack free tier | So the demo link isn't dead the one time someone checks it |

---

## 7. Suggested Order of Operations

1. ~~Half day: basic per-user rate limiting on the PDF export routes, the YouTube title fetch, and note/video creation~~ — done 2026-07-20.
2. ~~Half day: rewrite `README.md`~~ — done.
3. ~~1 day: build the showcase homepage~~ — done (hero, feature rows, About, FAQ, CTA, footer, GSAP animation).
4. ~~1 day: ship a way to demo without a Google login~~ — done, via the anonymous `/demo` route rather than the originally-planned share link.
5. **1-2 hours**: swap `lib/puppeteerBrowser.ts` from `puppeteer` to `puppeteer-core` + `@sparticuz/chromium` — the one remaining code change, needed specifically because the deploy target is Vercel (see §3, §6).
6. **Half day**: deploy to Vercel + Neon, wire up the demo-account cleanup cron (already configured in `cron/vercel.json`, just needs the project connected), smoke-test the golden path — including `/demo` — end to end on the live URL.
7. After that: pick one Tier 2/3 feature that's genuinely interesting to build (collection-level notebook view, tagging, AI recap), not the one that looks best on paper — genuine depth reads better than checklist completeness. A dedicated read-only share link (distinct from `/demo`) is also worth revisiting if "share one specific video with someone" becomes a real use case.

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
