# Auto-Sync Logic: Virtuoso → TanStack Virtual Migration

Logic-only breakdown of architectural changes when switching virtualizers, focusing on how note cards follow player time.

## Step 1: Time Source (Virtualizer-Agnostic)
- Player time must become **reactive state**, not a non-reactive `useRef`
- Update on every playback tick via `onProgress`/`onTimeUpdate` event, not just on pause/seek/buffer
- This is the biggest architectural fix and applies regardless of which virtualizer you choose
- Without this, the auto-follow feature will remain frozen at video start

## Step 2: Throttle the Time
- Wrap the reactive time state in `useThrottleValue(currentTime, 600ms)` 
- Prevents re-calculations and scroll calls from firing dozens of times per second
- Logic is unchanged from Virtuoso version — purely a performance optimization
- Independent of virtualizer choice

## Step 3: Compute Active Note Index
- Binary-search the sorted notes array by timestamp: find the last note whose timestamp ≤ current throttled time
- This is the "active" note definition (point timestamps, not ranges)
- Logic has **nothing to do with the virtualizer** — it operates on the data array, not rendered DOM
- `floorIndexByTime()` function can be reused verbatim

## Step 4: Identify Which Row Is "Active" in Render
| Virtuoso | TanStack Virtual |
|----------|------------------|
| Library hands you `(index, item)` for each row in `itemContent` prop | You iterate the virtualizer's internal list of rendered "virtual items"; each carries its own index |
| Compare: `index === activeIndex` | Compare: `virtualItem.index === activeIndex` |
| Conceptually identical — just the rendering loop location changes | You write the loop; virtualizer reports which rows are currently in viewport |

## Step 5: Auto-Scroll to Active Row
| Virtuoso | TanStack Virtual |
|----------|------------------|
| Imperative method on component ref: `listRef.current.scrollToIndex({ index, align, behavior })` | Imperative method on virtualizer instance: `virtualizer.scrollToIndex(index, { align, behavior })` |
| Virtuoso manages the scrollable container internally | You create and own the scrollable container (pass it to virtualizer via `getScrollElement`) |
| Functionally the same; different object holds the method | Store virtualizer in a ref; call the method identically |

**Effect logic (unchanged conceptually):**
```
if (!userBrowsing && activeIndex >= 0) {
  [virtualizer or listRef].scrollToIndex(activeIndex, { align: 'start', behavior: 'smooth' })
}
```
Bonus: This also fixes the `aligh` typo from the original Virtuoso code (correct spelling: `align`).

## Step 6: User-Browsing Pause/Resume
| Virtuoso | TanStack Virtual |
|----------|------------------|
| Virtuoso exposes `onScroll` prop; attach directly | You own the scroll container element; attach scroll listener yourself |
| Library handles event attachment | You attach/cleanup listener in useEffect |
| Otherwise identical logic | Same state machine: user scroll → pause auto-follow; 5s idle → resume |

**Pattern:**
```js
// In useEffect cleanup
const scrollContainer = parentRef.current;
if (scrollContainer) {
  scrollContainer.addEventListener('scroll', handleUserScroll);
  return () => scrollContainer.removeEventListener('scroll', handleUserScroll);
}
```

## Step 7: Handle Variable-Height Rows
| Virtuoso | TanStack Virtual |
|----------|------------------|
| Auto-measures row height after render | Needs explicit configuration |
| No additional wiring required | Estimate a default OR measure each row dynamically |

**Options for TanStack Virtual:**
- **Fixed estimate**: `estimateSize: () => 96` (rough guess, simpler but inaccurate for long notes)
- **Dynamic measurement**: Measure actual row element height after render
  ```js
  measureElement: (el) => el?.getBoundingClientRect().height,
  // + attach ref={virtualizer.measureElement} to each row (with data-index)
  ```

## Summary: What Moves, What Stays

| Aspect | Change? | Details |
|--------|---------|---------|
| Time throttling | ❌ No | Reuse `useThrottleValue` unchanged |
| Active index calculation | ❌ No | Reuse `floorIndexByTime` unchanged |
| Highlight styling | ✅ Minor | Still `index === activeIndex`; just computed differently in render loop |
| Auto-scroll call | ✅ Minor | Different object (virtualizer vs component ref); identical parameters |
| Scroll listener | ✅ Yes | You own the container; attach listener in useEffect |
| Row measurement | ✅ Yes | You must configure (estimate or dynamic measurement) |
| User-browsing state machine | ❌ No | Logic unchanged; just wired to your scroll listener |

## The Bigger Picture
The *decision logic* (throttle → active index → highlight → scroll if not user-browsing) is **100% portable**. What changes is *who owns the scroll container and the imperative scroll trigger*:
- **Virtuoso**: Library owns container and exposes scroll method on its component ref
- **TanStack Virtual**: You own container and call method on the virtualizer instance

Both are declarative at the architecture level; the virtualizer is just a mechanism for rendering only visible rows efficiently.
