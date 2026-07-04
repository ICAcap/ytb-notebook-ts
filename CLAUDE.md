# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube Notebook: A Next.js 16 application for managing video collections with timestamped notes. Users authenticate via Google OAuth, create video collections, and attach time-stamped rich-text notes to videos.

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
  - Note: tied to User and Video; has `startTime`, `endTime`, `color`, and JSON `content` (Tiptap)
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
- `src/app/tiptap/page.tsx` — Rich text editor demo/test page (dev only)

### Shared Components (`src/_components/`)
- `sidebar.tsx` — Navigation sidebar with collapse/expand, theme toggle (light: cmyk, dark: night via DaisyUI)
- `ModalSkeleton.tsx` — Reusable modal wrapper using HTML `<dialog>` element
- `pagination.tsx` — Pagination controls
- `SignOutButton.tsx` — Sign-out action button
- `src/app/themeProvider.tsx` — `ThemeProviders` wrapper using `next-themes`; sets `data-theme` attribute (light: "cmyk", dark: "night"); prevents theme flash on load

### Rich Text Editor (`src/_components/RichTextEditor/`)
Full Tiptap-based editor suite. Note content is stored as Tiptap JSON, not plain text.
- `TextEditor.tsx` — Main editor component; accepts/emits content as JSON
- `MenuBar.tsx` — Formatting toolbar: bold, italic, headings, colors, alignment, lists, undo/redo
- `TiptapExtension.ts` — Tiptap extension configuration
- `styles.scss` — Editor-specific styles (Sass)

### Video Components (`src/app/videos/_components/`)
- `VideoCard.tsx` — Video list item display
- `VideoSearchBar.tsx` — Search input with fuzzy-matched (Fuse.js) title autocomplete dropdown; debounced (250ms) suggestion lookup, closes on outside click/selection/clear, reopens on refocus if suggestions are cached
- `AddVideoButton.tsx` — Modal trigger + context for multi-stage video add form
- `AddVideoForm.tsx` — Two-stage form: (1) YouTube URL validation, (2) Title & collections
- `EditVideoForm.tsx` — Stub for video editing (not yet implemented)
- `CollectionBadgeList.tsx` — Filterable collection badges; links filter video list by collection
- `EditableNoteForm.tsx` — Form for creating/editing notes: time range, color picker, rich text (Tiptap)
- `NoteCard.tsx` — Individual note display: timestamp seeking, rendered rich text, edit/delete actions

### Video Detail Components (`src/app/videos/[id]/_components/`)
- `VideoPlayerAndNotesContainer.tsx` — Top-level orchestrator; wires VideoPlayer + NoteContainer + CollectionBadgeList; owns throttled playback time sync (750ms)
- `VideoPlayer.tsx` — ReactPlayer wrapper; saves playback position via `updateVideoPlayedTime`; throttle (30s heartbeat) + debounce (3s on pause/seek/end); resumes from `lastPlayedTime` on mount; uses lodash
- `NoteContainer.tsx` — Manages notes display; sticky header with collapsible add form; sorts by `startTime` then `createdAt`; handles CRUD via child callbacks; receives `playerRef` to capture current time

### Collection Components (`src/app/collection/_components/`)
- `CollectionContextProvider.tsx` — Context provider for collection userId
- `AddCollectionButton.tsx` — Modal trigger for new collection
- `CollectionCard.tsx` — Collection card UI
- `CollectionForm.tsx` — Collection creation/edit form

### Modal & Context Patterns
**Modal System**: `ModalSkeleton` wraps `<dialog>` and manages `isOpen`/`onClose` props. Used for add video, add collection.

**AddVideoButton Pattern**: 
- Manages modal state (`modalOpen`, `showStage2`) and form data via refs (YouTube ID, existing video check, fetched title, collection options)
- Provides context (`AddVideoButtonContext`) to child `AddVideoForm`
- Resets state on modal close

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
  - `getVideoCardsWithSearchParam(userId, page, pageSize, q, collection)` — Paginated search with title matching and collection filter
  - `getVideoNumWithSearchParam(userId, q, collection)` — Total count for pagination
  - `getAllUniqueVideoTitles(userId)` — All distinct video titles for a user (cached); used to build the search bar's autocomplete index
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
- **Note queries** (`lib/dbTableAction/noteTableAction.ts`):
  - `getNotesByVideo(userId, videoId)` — All notes for a video (cached, sorted by startTime then createdAt)
  - `getNotesByColor(userId, videoId, color)` — Filter notes by color
  - `getNoteCountByVideo(userId, videoId)` — Note count for a video
  - `getNotesByUser(userId, page, pageSize)` — Paginated notes for user
  - `getNoteCountByUser(userId)` — Total note count for user
  - `createNote(NoteCreation)` — Create new note
  - `updateNote(NoteUpdate)` — Update existing note
  - `deleteNote(userId, noteId)` — Delete note
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
- **Theme System**: `next-themes` via `ThemeProviders` (`src/app/themeProvider.tsx`); `data-theme` attribute on `<html>` (light: "cmyk", dark: "night"); prevents flash on load
- **Sass**: Used for rich text editor styles (`styles.scss`)
- React Compiler enabled in `next.config.ts`

### Utilities & Helpers
- **YouTube utilities** (`utils/youtube.ts`):
  - `getYoutubeId(url)` — Extract video ID from YouTube URL
  - `YOUTUBE_URL_REGEX` — Regex pattern for URL validation in forms
- **YouTube server fetch** (`utils/youtubeFetchTitleServerSide.ts`):
  - `fetchYouTubeTitle(videoId, apiKey)` — Server-side fetch of video title from YouTube API v3 (cached)
- **Timestamp formatting** (`utils/formatTimeStamp.ts`):
  - `formatTimeStamp(seconds)` — Format seconds to MM:SS or H:MM:SS
  - `getH()`, `getM()`, `getS()` — Extract hours/minutes/seconds from a duration
- **Note colors** (`utils/noteColors.ts`):
  - `NOTE_COLORS` — Predefined color palette for notes (gray, blue, green, gold, red)
- **React Hook Form**: Used for form management (register, Controller, watch, handleSubmit)
- **React Select**: Multi-select dropdown (collection selection in AddVideoForm)
- **Lodash**: throttle/debounce for video playback, scroll, and search input
- **Fuse.js**: Fuzzy search against video titles for `VideoSearchBar` autocomplete
- **react-hot-toast**: Toast notifications
- **@tanstack/react-virtual**: Virtualized list rendering
