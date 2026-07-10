# YTB Notebook — Product & Codebase Assessment (2026-07-09)

A from-the-code read of where this project stands, whether it's deployable, what to build next, and what to use for a showcase homepage. Based on direct inspection of the repo (schema, data layer, auth, components, git history) plus research on what gets developers hired in 2026.

> This assessment was originally written in June 2026 and re-verified twice since (2026-07-08, 2026-07-09). Earlier drafts tracked corrections as a bolted-on addendum; this version folds everything into one current read so it doesn't contradict itself mid-document.

---

## TL;DR

- **Architecturally solid.** Auth, data isolation, schema design, and Next.js App Router usage are all done correctly — not "tutorial-quality."
- **Two of the original blockers are closed**: the exposed `/tiptap` dev route is deleted, and `.env.example` now documents every required credential.
- **A real feature shipped since the original draft**: authenticated, XSS-hardened PDF export (single note + whole-video) backed by a cached warm Puppeteer instance — a genuinely good systems-design talking point.
- **Four blockers remain**, all cheap: no rate limiting, `README.md` is still `create-next-app` boilerplate, `screenshotUrl` is a dead schema field, and there's no `error.tsx`/security headers/`LICENSE`.
- **Remaining effort to "launchable as a resume portfolio piece": ~1.5–2 focused days**, no architecture changes required.

---

## 1. What's Already Strong (worth saying out loud in an interview)

- **Every query is scoped by `userId`.** `lib/dbTableAction/noteTableAction.ts`, `videoTableAction.ts`, and `collectionTableActions.ts` all filter/update/delete by `userId` + record id together — this is the actual fix for IDOR bugs, not an afterthought. Most side projects get this wrong.
- **Real Next.js App Router patterns**: server components fetch data directly (`src/app/videos/page.tsx`), search/pagination work via a plain `GET` form (works without JS, bookmarkable, no client-side fetch waterfall), `Suspense` boundaries are in the right places.
- **Auth done properly**: better-auth + Google OAuth + Prisma adapter, session cookie caching configured, `requireSession()` wrapped in React's `cache()` so it's not re-fetched per component.
- **Schema reflects actual query patterns**: composite uniqueness (`[userId, youtubeVidID]`, `[userId, collectionName]`), indexes on `userId` and `userId+createdAt` specifically because those are the lookup paths used — this isn't `@@index` cargo-culting.
- **Note content stored as structured Tiptap JSON, not raw HTML** — avoids stored-XSS by construction; rendering uses `@tiptap/static-renderer`'s `renderToReactElement`/`renderToHTMLString` rather than `dangerouslySetInnerHTML`.
- **Playback UX is genuinely thought through**: throttled (750ms) + debounced position saves, resume-from-`lastPlayedTime`, auto-scroll-pause-while-editing — small details that separate "I followed a tutorial" from "I used this myself and fixed what annoyed me."
- **PDF export (new since June draft, commits `f730ad3`…`4dbfcf5`)**: two authenticated routes (`src/app/api/notes/[noteId]/pdf`, `src/app/api/notes/video/[videoId]/pdf`), both call `requireSession()` and scope by `userId`. `utils/puppeteerBrowser.ts` caches a **warm Puppeteer `Browser` on `globalThis`, keyed by the launch Promise** (not the resolved value), so concurrent requests await one in-flight launch instead of racing separate `puppeteer.launch()` calls, with auto-recovery on `disconnected`. `escapeHtml()` sanitizes the video title before it's interpolated into the HTML passed to `page.setContent()`, and `setJavaScriptEnabled(false)` closes the obvious stored-XSS/SSRF vector. This is a substantive, interview-ready systems-design answer: "shared warm-process pool for an expensive external resource, promise-based dedup to avoid a launch race, XSS hardening on the render path."
- **19+ migrations across ~5 weeks** of steady, incremental schema evolution (renames, index additions, cascade-rule fixes) — real iteration, not a single big-bang commit.

---

## 2. Blockers Before Calling This "MVP Deployable"

**Closed:**
1. ~~`/tiptap` exposed, unauthenticated dev route~~ — deleted (`git log`: "remove test tiptap page"). No `src/app/tiptap` directory exists.
2. ~~No `.env.example`~~ — exists at repo root, documents all required vars with comments on where to get each credential (`TEST_USER_ID`/`TEST_VID_ID` are seed-script-only, correctly omitted).

**Still open:**
3. **No rate limiting anywhere.** Confirmed: zero hits for `rateLimit`/`ratelimit` across the repo. This now covers *three* unmetered surfaces, not the original two:
   - `fetchYouTubeTitle()` (`utils/youtubeFetchTitleServerSide.ts`) — shares one `YOUTUBE_API_KEY` across every user against Google's 10,000-unit/day free quota.
   - Unbounded note/video creation.
   - The PDF export routes — a Puppeteer page render is far more expensive per-request than a DB write, so a loop hitting `/api/notes/video/[videoId]/pdf` is now the most effective way to exhaust server resources. This is why rate limiting is the top priority, not just a nice-to-have.
4. **`README.md` is still the unmodified `create-next-app` boilerplate.** For a public repo this is the first thing a hiring manager sees. Still the single highest-leverage item for portfolio presentation.
5. **`screenshotUrl` is a dead field.** Present in `prisma/schema.prisma`, `NoteCreation`/`NoteUpdate` types, `NoteCard`, `EditableNoteForm`, `NoteContainer` — nothing sets it (no upload route, no capture UI). Cut it or wire it up.
6. **No security headers** (`next.config.ts` has no `headers()`), **no `LICENSE`.** Confirmed absent. `global-error.tsx` is now implemented (DaisyUI-themed fallback with a `reset()`-wired retry button) — closes the root-level error-boundary gap; a per-segment `error.tsx` (e.g. for `/videos`) is still optional polish, not required. (`robots.ts`/`sitemap.ts` dropped from this list — the app is fully auth-gated behind Google OAuth, there's no public/indexable content to control crawling on, so it's a no-op until a public route — e.g. the Tier 1 share link — actually exists. See Tier 4 in Section 4.)

None of these require touching the data model or architecture. This is a polish pass, not a rebuild.

---

## 3. So — Is It "MVP Deployable" in the 2026 Market?

Two different questions hide in that one:

**(a) Deployable as a real product, for real users?** Architecturally yes — auth and data isolation are correct. Mechanically, blocked only by #3 (rate limiting) now — the exposed dev-route blocker from the original draft is gone.

**(b) Deployable as a portfolio piece to land a job right now?** Per current hiring-manager research ([sources below](#sources)): the bar in 2026 is a small number (2–3) of *polished, deployed* projects with a strong README and visible architecture — not a pile of unfinished repos, and explicitly *not* another tutorial clone (to-do apps, weather apps, Netflix clones are specifically called out as not moving the needle). 84% of employers reportedly want to see a working, live app, not just source.

This project already clears the hardest bar — it's not a tutorial clone, and the architecture is real. What's still failing is the cheap part: *deployed, documented, demoable without your Google login.* Recommend proceeding to launch, in this order:
1. Basic rate limiting on the PDF/note/video-creation routes — a few hours given no infra exists yet; IP- or user-ID-based token bucket is enough for a portfolio deploy.
2. Rewrite `README.md`.
3. Deploy to Vercel + Neon per the checklist in Section 6.
4. Everything in Section 4 (share links, showcase homepage) is additive polish, not a blocker — ship after the live link exists.

---

## 4. Feature Additions Worth Considering

**Tier 1 — cheap, finishes the product, directly serves the "demoable" gap above:**
- **Public, read-only share link** for a single Video+Notes or a whole Collection. Right now the only way to show this to anyone is to hand them your Google account — confirmed no such feature exists yet. This single feature does more for "is this deployable as a demo" than anything else on this list.
- **Search across note *content***, not just video titles — Tiptap JSON can be flattened to plain text and matched; currently only titles are searchable.
- **Export notes** — already shipped as PDF; Markdown export would be a cheap addition on top of the existing Tiptap-JSON-to-plain-text path if the content search feature above gets built.

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
| Error tracking | Sentry free tier (5k events/mo) | Wire into the currently-missing `error.tsx`/`global-error.tsx` |
| CI | GitHub Actions (free for public repos) | Lint + build (+ tests later) on every push |
| Uptime | UptimeRobot or Better Stack free tier | So the demo link isn't dead the one time someone checks it |

---

## 7. Suggested Order of Operations

1. **Half day**: basic per-user/per-IP rate limiting on note/video creation and the PDF export routes; harden the YouTube title cache. Highest priority — the PDF routes make this an availability risk, not just cost overrun.
2. **Half day**: rewrite `README.md` with screenshots + a short architecture section; add `LICENSE`.
3. **Half day**: deploy to Vercel + Neon, smoke-test the golden path end to end on the live URL.
4. **1 day**: build the showcase homepage from the template/section sources above.
5. **1 day**: ship the public read-only share link (Tier 1 feature) — the single highest-leverage item on the whole list, because it turns "trust me, it works" into something a hiring manager can click.
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
