# Phase 4.5, Item 2: Own Reviews in Feed

## Context

`HomeFeed` (`src/components/home/home-feed.tsx`) currently gates its entire review-fetching block on `followingIds.length > 0`. A user who follows nobody sees the full "YOUR FEED IS EMPTY" panel (`WhoToFollowList` variant="panel") regardless of whether they've posted their own reviews — there's no path for the viewer's own `profile_id` into the feed query at all.

## Decisions (settled via grilling session, 2026-07-07)

1. **Feed query**: include the viewer's own `profile_id` alongside `followingIds` in the `reviews` query (`.in('profile_id', [...followingIds, user!.id])`), so the block runs unconditionally instead of being gated on `followingIds.length > 0`. `diary_entries` stay excluded, unchanged from today (already commented out — see [[feed]] in `CONTEXT.md`).
2. **Empty feed state gate**: switch from gating on `followingIds.length === 0` to gating on `feedItems.length === 0`. The full empty-state panel now only appears when the viewer has zero reviews of their own *and* follows nobody with reviews — see [[empty-feed-state]].
3. **Follow nudge when feed is non-empty but `followingIds` is 0**: add a slim banner variant above the feed list (distinct from the full panel), nudging the viewer to follow people, in the case where they have own reviews but no follows yet. See [[follow-nudge]].
4. **Copy for the "nothing new" message**: when `feedItems.length === 0` but this is reached via the `followingIds.length > 0` branch... actually, per decision 2, if `feedItems.length === 0` the empty-state panel always shows now (that branch subsumes the old "people you follow haven't logged anything yet" case, since an empty feed by definition means the viewer also has 0 own reviews). The old middle branch (`followingIds.length > 0 && feedItems.length === 0`) with its own copy no longer needs to exist as a separate branch — it collapses into the empty-state panel. Copy inside the panel should read "You and the people you follow haven't logged anything yet" to stay accurate now that self is included in the query. (Superseded by decision 2 once implemented — flagged here since it changes the shape from a 3-way branch to a 2-way branch.)

## Approach

### `src/components/home/home-feed.tsx`

1. Compute `const feedProfileIds = [...followingIds, user!.id]` and drop the `if (followingIds.length > 0)` guard around the reviews/diary/likes fetch — always run it against `feedProfileIds`.
2. Replace the 3-way render branch (`followingIds.length === 0` / `feedItems.length === 0` / else) with a 2-way branch:
   - `feedItems.length === 0`: full empty-state panel, copy updated to "You and the people you follow haven't logged anything yet. Here's a few to get you started." (merges the old two empty-copy variants into one, since both cases now mean the same thing — nothing in `feedProfileIds` has posted).
   - else: render `feedItems`, and if `followingIds.length === 0`, prepend a slim follow-nudge banner above the mapped `FeedCard`s (new small component or inline JSX using `WhoToFollowList` data, distinct visual treatment from the panel — compact single row, not the 2-col grid).
3. No changes to the `reviewCounts`/`whoToFollowData` computation or the persistent aside `WhoToFollowList` (variant="sidebar") — those are already unconditional and correct.

### Tests

- Extend/add a test for `HomeFeed` (or the relevant existing feed test, if any) covering: (a) viewer follows 0 people, has own reviews → sees feed + slim banner, not the full panel; (b) viewer follows 0 people, has no reviews → sees full empty-state panel; (c) viewer follows someone with reviews and has own reviews → both appear, most recent first.
