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
- `components/sidebar.tsx` — Navigation sidebar with collapse/expand, theme toggle (light: retro, dark: abyss via DaisyUI)
- `components/ModalSkeleton.tsx` — Reusable modal wrapper using HTML `<dialog>` element
- `components/pagination.tsx` — Pagination controls
- `components/SignOutButton.tsx` — Sign-out action button
- `src/app/videos/_components/VideoCard.tsx` — Video list item display
- `src/app/videos/_components/VideoPlayer.tsx` — React Player wrapper
- `src/app/videos/_components/AddVideoButton.tsx` — Modal trigger + context for multi-stage video add form
- `src/app/videos/_components/AddVideoForm.tsx` — Two-stage form: (1) YouTube URL validation, (2) Title & collections
- `src/app/collection/_components/CollectionContextProvider.tsx` — Context provider for collection userId
- `src/app/collection/_components/AddCollectionButton.tsx` — Modal trigger for new collection
- `src/app/collection/_components/CollectionCard.tsx` — Collection card UI
- `src/app/collection/_components/CollectionForm.tsx` — Collection creation/edit form

### Modal & Context Patterns
**Modal System**: `ModalSkeleton` component wraps `<dialog>` element and manages `isOpen`/`onClose` props. Used throughout for modals (add video, add collection).

**AddVideoButton Pattern**: 
- Manages modal state (`openModal`, `showStage2`) and form data via refs (YouTube ID, existing video check, fetched title, collection options)
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
  - `getVideoCardsWithSearchParam(userId, searchParam, skip, take)` — Paginated search with title matching
  - `getVideoNumWithSearchParam(userId, searchParam)` — Total count for pagination
  - `getExistingVideo(userId, youtubeVidID)` — Check if video already added
  - `upsertYouTubeVideo(userId, youtubeVidID, title, collectionIds)` — Add/update video with collection associations
- **Collection queries** (`lib/dbTableAction/collectionTableActions.ts`):
  - `getUserCollectionNameIDs(userId)` — Get all collections (label/value pairs for select dropdowns)
  - Collection creation, update, delete actions
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
- **Theme System**: Sidebar uses `data-theme` attribute on `<html>` (light: "retro", dark: "abyss")
- React Compiler enabled in `next.config.ts`

### Utilities & Helpers
- **YouTube utilities** (`utils/youtube.ts`):
  - `getYoutubeId(url)` — Extract video ID from YouTube URL
  - `YOUTUBE_URL_REGEX` — Regex pattern for URL validation in forms
  - `fetchYouTubeTitle(videoId)` — Server-side fetch of video title from YouTube API
- **React Hook Form**: Used for form management (register, Controller, watch, handleSubmit)
- **React Select**: Multi-select dropdown component (used for collection selection in AddVideoForm)
