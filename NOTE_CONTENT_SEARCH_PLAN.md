# Plan: Search Across Note Content

Companion to `PRODUCT_ASSESSMENT.md` — implements the Tier 1 "search across note
content" feature. Decisions locked in with the user before writing this:

- **Surface**: a separate note-search page (not merged into the existing
  `/videos` title search bar).
- **Storage**: a plain-text mirror column on `Note` (`contentText`), searched
  with case-insensitive `contains` — same pattern already used for video
  title search. Chosen over Postgres `tsvector` full-text search because it
  needs no generated column, no GIN index, no raw SQL, and this is a
  personal-notes app, not a document-search product — `contains` is plenty
  fast at this scale and reuses infra that already exists.

Not yet decided (flagged inline below): whether clicking a search result
should deep-link to the note's timestamp in the video player. Today
`/videos/[id]` has no query-param seek support — landing on the page just
starts playback from `lastPlayedTime` as usual. Worth a decision before
building the result-card link behavior.

---

## 1. Schema change (done)

`prisma/schema.prisma` — add a plain-text mirror field to `Note`:

```prisma
model Note {
  ...
  content     Json   // Tiptap JSON (unchanged, still source of truth)
  contentText String @default("") @db.Text // flattened plain text, for search only
  color       String @default("#808080")
  ...
  @@index([userId, contentText]) // supports the search query pattern below
}
```

- `@default("")` avoids a required backfill step at migration time (existing
  rows get `""`, not `NULL`).
- Migration: `npx prisma migrate dev --name add_note_content_text`.
- **Backfill script** (one-off, `prisma/backfillNoteContentText.ts` or a
  seed-style script): iterate all existing `Note` rows, run the flattening
  util (below) over `content`, write `contentText`. Needed once so existing
  notes are searchable — new/edited notes populate it automatically going
  forward.

## 2. Flatten Tiptap JSON → plain text (done)

New util: `utils/tiptapToText.ts`

```ts
import { JSONContent } from "@tiptap/react";

export function tiptapToText(doc: JSONContent): string {
  const parts: string[] = [];
  const walk = (node: JSONContent) => {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
  };
  walk(doc);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
```

Simple recursive walk over Tiptap's node tree — no need for
`@tiptap/static-renderer` (that renders HTML/React, not plain text; using it
here would mean stripping markup back out, more work for the same result).

## 3. Populate `contentText` on write (done)

`lib/dbTableAction/noteTableAction.ts`:

- `createNote()` — compute `contentText: tiptapToText(content as JSONContent)`
  and include it in the `data` passed to `prisma.note.create`.
- `updateNote()` — same, in `prisma.note.update`.

Both already receive `content: InputJsonValue` — cast to `JSONContent` for
the util call (same pattern `NoteCard.tsx` already uses at
`src/app/videos/_components/NoteCard.tsx:25`).

## 4. New query: search notes by content

`lib/dbTableAction/noteTableAction.ts` — add alongside the existing
`getNotesByUser`/`getNoteCountByUser` pair, same shape (paginated,
`cache()`-wrapped):

```ts
export const getNotesByContentSearch = cache(async function (
  userId: string,
  q: string,
  page: number,
  pageSize: number,
): Promise<Note[]> { ... });

export const getNoteContentSearchCount = cache(async function (
  userId: string,
  q: string,
): Promise<number> { ... });
```

- `where: { userId, contentText: { contains: q, mode: "insensitive" } }`
- Empty `q` → return `[]` / `0` early (mirrors the guard style already used
  throughout this file), since an empty-query note dump isn't the point of
  this feature — the paginated "all my notes" browse already exists via
  `getNotesByUser`.
- Also need each result's parent video title (for the result card and the
  link target) — either `include: { video: { select: { title: true,
  videoId: true } } }` on the query, or a second batched lookup. `include`
  is simpler and matches how `getVideoById` already includes `collections`.

## 5. New page: `/notes/search`

`src/app/notes/search/page.tsx` — server component, same skeleton as
`src/app/videos/page.tsx:22-115`:

- `requireSession()` → `userId`.
- Read `searchParams` for `q`, `page`.
- `Promise.all([getNotesByContentSearch(...), getNoteContentSearchCount(...)])`.
- Reuse `Sidebar`, `Pagination` components as-is.
- Empty-`q` state: show a prompt ("type to search your notes") rather than
  an empty/error state, since there's no default listing for this page.

New component: `src/app/notes/_components/NoteSearchBar.tsx` — much
simpler than `VideoSearchBar.tsx` (no Fuse.js autocomplete needed; note
content isn't a small fixed list like video titles, so client-side fuzzy
suggestions aren't practical). Plain debounced-input-driven `router.push`
on submit, same `join w-full` form pattern.

New component: `src/app/notes/_components/NoteSearchResultCard.tsx` — one
per match. Needs:
- Parent video title (link to `/videos/[videoId]`) + collection context if
  useful.
- Rendered note content — reuse the same `renderToReactElement` +
  `TiptapExtensions` pattern from `NoteCard.tsx:172-175`, OR render a
  short plain-text snippet from `contentText` with the match highlighted
  (cheaper, more scannable in a list of results — recommend this over full
  rich-text rendering per card).
- Timestamp badge(s) — same `formatTimeStamp` util, but **static display
  only** unless the deep-link decision below is resolved (no `playerRef` to
  seek against on this page).

## 6. Open decision: deep-linking to the timestamp

Clicking a search result should plausibly jump straight to that moment in
the video, not just open the video page. Two options, not yet chosen:

- **A. Query param + client-side seek**: link to
  `/videos/[id]?t=123`, then `VideoDetailView.tsx` reads `t` on mount and
  seeks `playerRef` once metadata is loaded. Small addition to an existing
  component.
- **B. Skip it for v1**: link just opens `/videos/[id]`; the notes panel
  already sorts by `startTime` so the target note is visible near the top.
  Cheaper, ships faster, matches "additive polish" framing from the
  assessment.

Recommend **A** — it's the actual payoff of the feature (search → land
exactly where the moment is), and the addition to `VideoDetailView.tsx` is
small. But flagging explicitly since it wasn't part of the original
storage/surface decisions.

## 7. Nav entry

`src/_components/sidebar.tsx:37-42` — add a `navigation` entry, e.g.
`{ name: "Search Notes", href: "/notes/search", icon: Search }` (lucide
already imported elsewhere in the codebase). Placement: after "Collection",
before "Setting".

## 8. Sequencing

1. Schema + migration + backfill script (§1) — do this first, independently
   testable via Prisma Studio.
2. `tiptapToText` util (§2) — pure function, trivially unit-testable.
3. Wire into `createNote`/`updateNote` (§3).
4. Query functions (§4).
5. Resolve §6 (deep-link decision) before building §5's result card, since
   it changes what the link target looks like.
6. Page + components (§5).
7. Sidebar nav entry (§7).
8. Manual smoke test: create a note with distinctive text, search for a
   substring, confirm it surfaces and links correctly; confirm a note
   belonging to another seeded user does NOT surface (userId scoping).

No changes needed to `NoteCreation`/`NoteUpdate` public types — `contentText`
is derived server-side inside the table-action functions, not passed in by
callers (`EditableNoteForm.tsx` stays untouched).
