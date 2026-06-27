# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Notebook: A Next.js 16 application for managing video collections with timestamped notes. Users authenticate via Google OAuth, create video collections, and attach time-stamped notes to videos.

## Core Architecture

### Authentication (better-auth)
- **Setup**: `lib/auth.ts` configures BetterAuth with PostgreSQL + Prisma adapter
- **Google OAuth**: Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- **API Handler**: `src/app/api/[...all]/route.ts` routes all auth requests via `toNextJsHandler(auth.handler)`
- **Type**: Export `Session` type from auth config for type-safe session access
- **Client**: `lib/auth-client.ts` provides client-side auth utilities
- **Server-side checks**: `lib/requireSession.ts` validates session and redirects to sign-in if missing

### Database (PostgreSQL + Prisma)
- **Schema**: `prisma/schema.prisma` — User, Video, Note, Collection models plus BetterAuth tables
- **Key Relationships**:
  - User → many Videos, Collections, Notes (soft relationships)
  - Video → many Notes (hard delete cascade)
  - Collection ↔ Video (many-to-many implicit in schema)
  - Note is always tied to both User and Video
- **Indexes**: Optimized for user_id and user_id+createdAt lookups on Video/Collection/Note
- **Prisma Client**: Output to `generated/prisma` (generated location)

### Frontend Pages
- `src/app/page.tsx` — Home/landing with sign-in form
- `src/app/dashboard/page.tsx` — Main dashboard (protected)
- `src/app/videos/page.tsx` — Video list with search and pagination (protected)
- `src/app/videos/[id]/page.tsx` — Video player and notes view (protected)
- `src/app/collection/page.tsx` — Collections management with grid layout (protected)
- `src/app/setting/page.tsx` — User settings (protected)
- `src/app/(auth)/sign-in/page.tsx` — Sign-in form component
- `src/app/layout.tsx` — Root layout with Tailwind + Geist font

### Shared Components
- `components/sidebar.tsx` — Navigation sidebar with collapse/expand, theme toggle (light: retro, dark: sunset via DaisyUI)
- `components/ModalSkeleton.tsx` — Reusable modal wrapper using HTML `<dialog>` element
- `components/pagination.tsx` — Pagination controls
- `components/SignOutButton.tsx` — Sign-out action button
- `src/app/themeProvider.tsx` — `ThemeProviders` wrapper using `next-themes`; sets `data-theme` attribute (light: "retro", dark: "sunset"); prevents theme flash on load

### Video Components (`src/app/videos/_components/`)
- `VideoCard.tsx` — Video list item display
- `AddVideoButton.tsx` — Modal trigger + context for multi-stage video add form
- `AddVideoForm.tsx` — Two-stage form: (1) YouTube URL validation, (2) Title & collections
- `EditVideoForm.tsx` — Stub for video editing (not yet implemented)

### Video Detail Components (`src/app/videos/[id]/_components/`)
- `VideoPlayer.tsx` — ReactPlayer wrapper; saves playback position via `updateVideoPlayedTime`; throttle (30s heartbeat) + debounce (3s on pause/seek/end); resumes from `lastPlayedTime` on mount; uses lodash for throttle/debounce
- `NoteContainer.tsx` — Manages notes display and creation; sticky header with collapsible "Add New Note" form; sorts notes by `startTime` then `createdAt`; handles note deletion/upserts via child callbacks; receives `playerRef` to capture current playback time for new notes

### Collection Components (`src/app/collection/_components/`)
- `CollectionContextProvider.tsx` — Context provider for collection userId
- `AddCollectionButton.tsx` — Modal trigger for new collection
- `CollectionCard.tsx` — Collection card UI
- `CollectionForm.tsx` — Collection creation/edit form

### Modal & Context Patterns
**Modal System**: `ModalSkeleton` component wraps `<dialog>` element and manages `isOpen`/`onClose` props. Used throughout for modals (add video, add collection).

**AddVideoButton Pattern**: 
- Manages modal state (`modalOpen`, `showStage2`) and form data via refs (YouTube ID, existing video check, fetched title, collection options)
- Provides context (`AddVideoButtonContext`) to child `AddVideoForm`
- Resets state on modal close (cleanup refs)

**CollectionContextProvider**:
- Simple context wrapping userId for child components (`AddCollectionButton`, forms)
- Wraps entire collection page to share userId

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database (npx prisma db seed)
npx prisma studio   # Open Prisma Studio (GUI for database)
npx prisma migrate dev --name <name>  # Create migration
npx prisma db push   # Apply schema changes (dev only)
```

## Important Notes

### Next.js 16 Breaking Changes
See `node_modules/next/dist/docs/` — this version has breaking changes in APIs, conventions, and file structure. Always consult the bundled Next.js docs before implementing features that touch the framework (routing, server components, middleware, etc.).

### React 19 & Compiler
- **React Compiler**: Enabled in `next.config.ts` (Babel plugin)
- **React 19**: Uses new hooks; check React docs for deprecated patterns from earlier versions

### Data Access Layer
- **Database utility**: `lib/prisma.ts` exports singleton PrismaClient
- **Video queries** (`lib/dbTableAction/videoTableAction.ts`):
  - `getVideoById(userId, videoId)` — Single video with collections (cached); returns `VideoDetailPageProp`
  - `getVideoCardsWithSearchParam(userId, page, pageSize, q)` — Paginated search with title matching
  - `getVideoNumWithSearchParam(userId, q)` — Total count for pagination
  - `getExistingVideo(userId, youtubeVidID)` — Check if video already added
  - `upsertYouTubeVideo(userId, youtubeVidID, title, collectionIds)` — Add/update video with collection associations
  - `updateVideoPlayedTime(videoId, userId, playedTime)` — Persist playback position in seconds
  - `deleteVideo(videoId, userId)` — Delete video and cascade-delete its notes; revalidates `/videos`
- **Collection queries** (`lib/dbTableAction/collectionTableActions.ts`):
  - `getUserCollectionNameIDs(userId)` — All collections as `{label, value}` pairs for react-select
  - `getUserCollectionByName(userId, collectionName)` — Lookup by composite unique key
  - `createCollection({userId, collectionName})` — Create; handles P2002 unique violation
  - `updateCollection({collectionId, collectionName})` — Rename collection
  - `deleteCollectionById(collectionId, userId)` — Delete collection
- **Session access**:
  - Server-side: `lib/requireSession.ts` validates session and throws redirect if missing
  - Client-side: `lib/auth-client.ts` provides auth utilities (signIn, signOut, etc.)

### Database Migrations
- Development: Use `npx prisma db push` or `npm run seed`
- Schema changes: Always update `prisma/schema.prisma` first
- Migration files are auto-generated by Prisma when using `prisma migrate dev`

### Styling & UI
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **DaisyUI**: Tailwind component library for buttons, cards, modals, etc.
- **Font**: Geist (auto-optimized via `next/font`)
- **Theme System**: `next-themes` via `ThemeProviders` (`src/app/themeProvider.tsx`); `data-theme` attribute on `<html>` (light: "retro", dark: "sunset"); prevents flash on load
- React Compiler enabled in `next.config.ts`

### Utilities & Helpers
- **YouTube utilities** (`utils/youtube.ts`):
  - `getYoutubeId(url)` — Extract video ID from YouTube URL
  - `YOUTUBE_URL_REGEX` — Regex pattern for URL validation in forms
  - `fetchYouTubeTitle(videoId)` — Server-side fetch of video title from YouTube API
- **React Hook Form**: Used for form management (register, Controller, watch, handleSubmit)
- **React Select**: Multi-select dropdown component (used for collection selection in AddVideoForm)
