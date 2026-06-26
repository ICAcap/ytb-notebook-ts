# Auto-Sync: Scroll the Note List to Follow Video Playback

## What this feature is

While the video plays, the note list should automatically scroll so the
"currently relevant" note card is visible — like a karaoke transcript, but
for timestamped notes instead of lyric lines. If the user manually scrolls
the note list (browsing notes while the video keeps playing), auto-scroll
should back off and not yank the list back under them.

**Status check on the codebase:** virtualization itself is already
implemented in [NoteContainer.tsx](src/app/videos/[id]/_components/NoteContainer.tsx)
via `useVirtualizer` (lines 34-40), with dynamic row-height measurement
already wired up (`ref={virtualizer.measureElement}` at line 142). That part
of the original doc is done — no more work needed there. What's missing is
everything below: turning playback time into state, computing which note is
"active," scrolling to it, and pausing that behavior while the user browses.

---

## Step 1 — Get the video's current time as React state

**The problem:** `playerRef` (an `HTMLVideoElement` ref, passed all the way
down from the video page into `NoteContainer`) is a *ref*, not state.
Mutating `playerRef.current.currentTime` never causes React to re-render.
Right now nothing in `NoteContainer` even looks at the player's time.

**The fix:** `NoteContainer` already receives `playerRef` as a prop
(line 22). Attach a native DOM listener directly to the underlying
`<video>` element and mirror its time into `useState`:

```ts
const [currentTime, setCurrentTime] = useState(0);

useEffect(() => {
  const video = playerRef.current;
  if (!video) return;
  const handleTimeUpdate = () => setCurrentTime(video.currentTime);
  video.addEventListener("timeupdate", handleTimeUpdate);
  return () => video.removeEventListener("timeupdate", handleTimeUpdate);
}, [playerRef]);
```

Why this is safe: the browser's native `timeupdate` event fires on the
`<video>` element itself, independent of React. [VideoPlayer.tsx](src/app/videos/[id]/_components/VideoPlayer.tsx)
already has its *own* `onTimeUpdate` prop on `<ReactPlayer>` (line 90) for
saving playback position — that's react-player's prop wiring, not a DOM
listener. Adding a second, separate `addEventListener("timeupdate", ...)`
in `NoteContainer` doesn't conflict with it; both just react to the same
underlying browser event independently. No changes to `VideoPlayer.tsx`
are needed.

`timeupdate` fires roughly 4-66 times/second depending on the browser —
frequent enough to feel smooth, too frequent to recalculate scroll position
on every tick (Step 2).

---

## Step 2 — Throttle the time updates

Re-running "which note is active + should I scroll" on every `timeupdate`
tick would mean dozens of redundant calculations and scroll calls per
second. Throttle it.

This codebase already depends on **lodash** for throttling/debouncing
(see `VideoPlayer.tsx` line 16, `_.throttle`) — reuse that instead of
writing a custom `useThrottleValue` hook:

```ts
const [throttledTime, setThrottledTime] = useState(0);
const throttleSetTime = useRef(_.throttle(setThrottledTime, 600)).current;

useEffect(() => {
  throttleSetTime(currentTime);
}, [currentTime, throttleSetTime]);
```

`currentTime` (Step 1) updates very frequently; `throttledTime` updates at
most once every 600ms and is what drives the rest of the logic below.

---

## Step 3 — Compute which note is "active"

Notes have point timestamps (`startTime`), not ranges, so "active" means:
the last note in the sorted list whose `startTime <= throttledTime`.

`NoteContainer` already builds `sortedNoteList` (lines 65-70), sorted by
`startTime` then `createdAt`, and already depends on lodash for
throttling — reuse `_.sortedLastIndexBy` instead of hand-rolling a binary
search:

```ts
// sortedLastIndexBy finds where { startTime: throttledTime } would be
// inserted into sortedNoteList to keep it sorted by startTime, landing
// after any ties ("last"). Subtracting 1 turns that insert position into
// the index of the floor element (last note with startTime <= throttledTime).
const activeIndex =
  _.sortedLastIndexBy(
    sortedNoteList,
    { startTime: throttledTime },
    (n: Note) => n.startTime,
  ) - 1;
```

Returns `-1` if no note's timestamp has been reached yet (e.g. video just
started, first note is at 0:30). This is pure array logic — nothing here
touches the virtualizer or rendering.

---

## Step 4 — Auto-scroll to the active row, with context

`virtualizer` is already in scope in `NoteContainer`. Call its imperative
scroll method when `activeIndex` changes. Use `align: "center"`, not
`"start"` — pinning the active note to the top edge hides everything before
it, so the active note ends up looking like the only note on screen.
Centering keeps a note or two of context visible above and below it:

```ts
useEffect(() => {
  if (!userBrowsing && activeIndex >= 0) {
    virtualizer.scrollToIndex(activeIndex, { align: "center", behavior: "smooth" });
  }
}, [activeIndex, userBrowsing, virtualizer]);
```

`userBrowsing` is the gate built in Step 5.

---

## Step 5 — Don't fight the user: pause auto-follow while they're browsing

`NoteContainer` already owns the scroll container — it's `scrollRef`
(line 33), attached to the outer `<div>` (line 74), which is also what's
passed to the virtualizer via `getScrollElement` (line 37). Attach a
scroll listener to that same element:

```ts
const [userBrowsing, setUserBrowsing] = useState(false);
const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  function handleUserScroll() {
    setUserBrowsing(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setUserBrowsing(false), 5000);
  }

  el.addEventListener("scroll", handleUserScroll);
  return () => {
    el.removeEventListener("scroll", handleUserScroll);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  };
}, []);
```

State machine: any scroll → `userBrowsing = true`, auto-scroll (Step 4)
stops firing. 5 seconds of no further scrolling → `userBrowsing = false`,
auto-follow resumes on the next active-index change.

**Gotcha:** the *programmatic* `scrollToIndex` call in Step 4 will itself
fire a native `scroll` event on `scrollRef`, which this listener can't
distinguish from a real user scroll — it would re-arm `userBrowsing` and
fight itself. Guard against it with a ref flag set right before calling
`scrollToIndex` and cleared after, e.g. on a microtask/short timeout, and
have `handleUserScroll` no-op while that flag is set.

---

## Summary of what's left to build

| Piece | New code needed? | Where |
|---|---|---|
| Reactive playback time | Yes | `NoteContainer.tsx` — new `useEffect` + `useState` |
| Throttling | Yes, but reuse `_.throttle` (already a dep) | `NoteContainer.tsx` |
| Active index calc | Yes — `floorIndexByTime` | new small util, e.g. `utils/floorIndexByTime.ts` |
| Auto-scroll call (centered, for context) | Yes, minor | `NoteContainer.tsx` — uses existing `virtualizer` |
| Scroll listener / idle timer | Yes | `NoteContainer.tsx` — uses existing `scrollRef` |
| Row measurement / virtualization | **No — already done** | already in `NoteContainer.tsx` |

Everything plugs into objects `NoteContainer` already owns
(`playerRef`, `scrollRef`, `virtualizer`, `sortedNoteList`) — no new
components, no new dependencies, no architecture change.
