# Phase 4.5, Item 1: Inline Home Search

## Context

Today, `/search` (`src/app/search/page.tsx`) is a self-contained client page: it owns mode toggle (albums/people), query, debounce, and `searchAlbums`/`searchProfiles` fetch state inline, with a centered full-page chrome (big `SEARCH` display heading, `max-w-2xl` column). The only entry point to it is a right-rail box in `src/components/home/home-feed.tsx` (`"⌕ SEARCH ALBUMS, PEOPLE…"`, a plain `<Link href="/search">`), visible only at the `xl` breakpoint on the home page. There is no Search item in the global left sidebar (`src/components/layout/sidebar.tsx`) — the `NAV_ITEMS` there are HOME/EXPLORE/NOTIF/PROFILE only, so "sidebar search entry point" in the Phase 4.5 spec refers specifically to this home-feed right-rail box, not a global affordance.

Separately, `src/components/logging/logging-modal.tsx` has its own third, independent debounced-search implementation (query/results/showDropdown state, `searchAlbums` only, no mode toggle) used to pick an album when logging a listen. It's meaningfully different in shape — selecting a result sets local component state and transitions the modal into a rating form, rather than navigating anywhere — and is out of scope for this change (confirmed with the user; noted below as a known duplication, not addressed here).

Goal: let users search without leaving the home feed, while keeping `/search` alive as a secondary, deep-linkable route (bookmarks, direct links, and reused by the logging flow's picker per the roadmap wording — though today the logging modal has its own search, so that reuse is aspirational, not current).

## Decisions (settled via grilling session, 2026-07-07)

1. **Placement**: an overlay anchored to the right-rail trigger box, not a full replacement of the main feed column and not confined to the aside's ~300px width. The feed stays mounted and untouched underneath.
2. **Overlay geometry**: a wider floating card (~420px, capped at `90vw`), right-aligned to the trigger so it can overlap the left edge of the feed column without disturbing feed layout or getting clipped at the viewport edge.
3. **State**: ephemeral component state only (`useState` in a client component) — no URL query param sync. Closing and reopening resets to an empty search; navigating away and back to `/` does the same. This matches the spec's framing of a lightweight in-place affordance, not a new routable view.
4. **Dismissal**: Escape key and click-outside close the overlay. (Re-clicking the trigger also closes it, since the trigger is the same toggle button that opens it — not an additional requirement, just a consequence of the toggle implementation.)
5. **Shared logic**: extract a `useSearch` hook (mode/query/debounce/fetch state, `searchAlbums`/`searchProfiles` calls, derived `showEmptyPrompt`/`showNoResults`/`trimmedQuery`) consumed independently by `/search/page.tsx` and the new inline overlay component. Each keeps its own JSX/chrome — the hook only owns behavior, not markup — since the two need very different visual treatment (full-page display heading vs. compact popover).
6. **Where state/trigger lives**: a new client component, `HomeSearchTrigger`, wraps the existing trigger box, owns `isOpen`, and renders the overlay positioned relative to itself. `home-feed.tsx` swaps its `<Link href="/search">` block for `<HomeSearchTrigger />` and otherwise stays an `async` Server Component — no broader restructuring of the feed's data fetching.
7. **LoggingModal**: explicitly left untouched. Its search is a distinct use case (albums-only, no mode toggle, selection replaces navigation with local state), and folding it onto `useSearch` now would mean designing the hook's API around a third, materially different consumer up front. Flagged as a future cleanup candidate, not addressed here.

## Approach

### 1. `src/hooks/use-search.ts` (new)

Extract the mode/query/debounce/fetch logic currently inline in `search/page.tsx` (lines 24–76) into a hook:

```ts
function useSearch(initial: { mode?: Mode; query?: string }) {
  // mode, setMode, query, setQuery, albumResults, peopleResults,
  // loading, hasSearched, trimmedQuery, showEmptyPrompt, showNoResults
}
```

Same debounce (250ms), same cancellation-on-cleanup behavior, same two server actions (`searchAlbums` from `@/lib/spotify/actions`, `searchProfiles` from `@/lib/profiles/actions`).

### 2. `src/app/search/page.tsx` (edit)

Replace the inline state/effect block with `useSearch({ mode: initialParams.mode, query: initialParams.q })`. Chrome (heading, mode toggle buttons, input, results list markup) stays as-is — this is a behavior-preserving refactor for this file.

### 3. `src/components/home/home-search-trigger.tsx` (new, `'use client'`)

- Renders the existing trigger button markup (currently the `<Link>` in `home-feed.tsx`'s aside), but as a `<button>` toggling local `isOpen` state instead of a navigation link.
- Wraps trigger + overlay in a `relative` container.
- When `isOpen`, renders the overlay: `useSearch({})` for state, compact chrome (smaller mode toggle, input with `autoFocus`, condensed result rows reusing the same album-cover/title/artist and avatar/username layouts as `/search` today, just tighter spacing), positioned `absolute right-0 top-full mt-2 w-[420px] max-w-[90vw] z-30` with the project's existing hard-shadow border treatment.
- Escape-key listener (`document` keydown, only attached while open) and click-outside listener (`document` mousedown, checking a ref around the whole trigger+overlay wrapper) both call the same close handler.
- Clicking a result navigates via `<Link>` exactly like `/search` does today; no explicit close-on-navigate handling needed since navigating away from `/` unmounts the component.

### 4. `src/components/home/home-feed.tsx` (edit)

Swap the aside's `<Link href="/search">⌕ SEARCH ALBUMS, PEOPLE…</Link>` block for `<HomeSearchTrigger />`. No other changes to this file — stays an `async` Server Component.

### 5. Tests

- Add/extend a Vitest + RTL test for `HomeSearchTrigger`: opens on click, closes on Escape, closes on outside click, renders album results from a mocked `searchAlbums`.
- If `search/page.tsx` has existing tests exercising the extracted state logic, verify they still pass unchanged against the hook-backed version (behavior-preserving refactor, not a rewrite of test expectations).

## Known follow-ups (not in this change)

- `LoggingModal`'s independent search implementation remains a third duplicated debounce/fetch pattern — candidate for a future unification once/if its UX (album-only, selection-replaces-navigation) is worth generalizing into `useSearch`.
- The Phase 4.5 spec's aspiration that `/search` "stays as... the album-logging flow's picker" doesn't reflect current code (the logging modal has always had its own picker) — worth a follow-up conversation if that consolidation is actually wanted later.
