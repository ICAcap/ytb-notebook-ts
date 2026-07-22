# YouTube Notebook

A Next.js app built for helping me (and hopefully you) organize YouTube videos that truly matter into collections and attaching timestamped, rich-text notes to them, and avoid getting sidetracked by algorithm suggestions (Because there isn't one on app). Sign in with Google, drop in a video URL, and take notes synced to playback time.

## Features

- **Google OAuth sign-in** via [better-auth](https://www.better-auth.com/)
- **Video collections** — group videos into named collections, filter by collection
- **Timestamped notes** — rich-text notes (via Tiptap) with a start/end time range, color-coded, jump straight to the moment in the video
- **Cross-video note search** — full-text + fuzzy search (Postgres `pg_trgm`) across all your notes, with collection/color filters
- **Playback position memory** — resumes each video where you left off
- **PDF export** — export a single note or all notes for a video as a PDF
- **Rate limiting** — Upstash Redis-backed limits on writes, PDF export, and YouTube API lookups

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 (React Compiler enabled)
- [Prisma](https://www.prisma.io/) + PostgreSQL
- [better-auth](https://www.better-auth.com/) for authentication
- [Tiptap](https://tiptap.dev/) for rich-text note editing
- [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [Puppeteer](https://pptr.dev/) for PDF generation
- [Upstash Redis](https://upstash.com/) for rate limiting
- Also other open-source dev tools that help me ship (check package.json for more details)

## Getting Started

### Prerequisites

- Node.js and a PostgreSQL database (preferably with the `pg_trgm` extension available)
- A Google OAuth client (Client ID/Secret, see: https://developers.google.com/identity/protocols/oauth2)
- An Upstash Redis instance (Optional at best)
- A YouTube Data API v3 key (Optional at best)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the required variables specified in `.env.example` (database connection, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, Upstash Redis credentials, YouTube API key, etc.).

3. Apply the database schema:

   ```bash
   npx prisma db push
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database (npx prisma db seed)
npx prisma studio    # Open Prisma Studio (GUI for database)
npx prisma migrate dev --name <name>  # Create migration
npx prisma db push   # Apply schema changes (dev only)
```

## Project Structure

- `src/app/` — Next.js App Router pages (dashboard, videos, notes, collections, settings) and API routes
- `src/_components/` — shared UI (sidebar, modals, pagination, rich-text editor)
- `lib/` — auth config, Prisma client, data access layer (`lib/dbTableAction/`), Puppeteer browser management
- `utils/` — YouTube helpers, timestamp formatting, note content utilities, rate limiters
- `prisma/` — schema, migrations, seed and backfill scripts

See [CLAUDE.md](./CLAUDE.md) for a detailed architecture overview.
