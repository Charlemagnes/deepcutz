# Phase 4.5, Item 3: Live Feed Updates

## Context

Base branch for this work is `staging`, not `main` — it already has Phase 4.5 items 1 (`feat: inline home search`) and 2 (`feat: own reviews in feed`) merged. `src/components/home/home-feed.tsx` on `staging` already builds `feedProfileIds = [...followingIds, user!.id]` and queries `reviews`/`diary_entries` scoped to that combined set (diary entries stay commented out of rendering — a separate, already-decided scope cut, not something this task touches).

No Supabase Realtime infrastructure exists anywhere in this codebase today: no table is added to the `supabase_realtime` publication, no component holds a realtime channel subscription. This task introduces that infrastructure for two independent consumers:

1. The home feed's "new reviews" banner (`reviews` table).
2. The sidebar's notification badge (`notifications` table).

## Research: how does Twitter's "N new posts" banner actually work?

Confirmed via web research (not assumed): Twitter does **not** wait for a click to fetch. The client is notified in real time (websocket → their internal "Live Users" push service), and the new posts are fetched and cached client-side in the background as soon as the event arrives — *only the DOM insertion / scroll re-anchoring is deferred* until the user clicks the pill. Critically, that background fetch still goes through Twitter's normal backend Home Timeline API — there's no direct client-to-database path in their architecture, real-time or not.

That last point directly resolved our own architecture question: this codebase's feed data has always been fetched server-side (inline in the `async` `HomeFeed` Server Component, via the cookie-bound `@/lib/supabase/server` client) — never a browser-side Postgres query. A **server action** is the correct analog to Twitter's Home Timeline API call, not a direct browser Supabase client query (which would be a first-of-its-kind pattern in this repo). So: realtime event arrives client-side → client calls a new server action to fetch the joined row → cached client-side → revealed on click (or auto-inserted, for the self-authored case — see decisions below).

No animation/fade-in anywhere — confirmed this doesn't match Twitter's actual (instant, non-animated) insertion behavior, and the original spec wording's "fade-in transition" is superseded by this decision.

## Decisions (settled via grilling session, 2026-07-07)

1. **Insert behavior — hybrid**: when the *viewer's own* new review arrives (self-authored, e.g. posted from another tab or the logging modal), it's fetched and inserted at the top of the list immediately — no banner, since the user just took that action themselves and expects to see it, same as Twitter auto-inserting your own new tweet. When a review from someone the viewer *follows* arrives, it does **not** auto-insert; it increments a click-to-reveal "N new reviews" banner instead. Reviews are still fetched (joined) eagerly in the background as each event arrives, matching Twitter — only the render/insert step is deferred.
2. **No animation**: rows appear instantly (both the auto-inserted self case and the revealed-on-click case) — no fade-in, no transition. `tw-animate-css` is not used for this feature.
3. **Realtime scope matches the current feed query**: the subscription filter is `profile_id=in.(feedProfileIds)` where `feedProfileIds` is the exact same `[...followingIds, user.id]` array `HomeFeed` already computes server-side today — no new inclusion logic, just wiring the existing scope into a realtime filter.
4. **Banner content — count only**: the banner reads e.g. "3 new reviews", tracking only how many qualifying INSERT events have arrived. It does not show avatars or previews. (The underlying rows are still fetched in full in the background per decision 1, so the click-to-reveal is instant — the banner text itself just stays cheap and simple.)
5. **Scroll on click**: clicking the banner reveals the pending reviews at the top of the list *and* scrolls the feed to the top, so a viewer scrolled deep in the feed actually sees the change, matching Twitter's behavior.
6. **Join-data fetch — new server action**: add `getFeedReviewById(reviewId)` (or similar) as a `'use server'` action, mirroring the exact join shape (`reviews` + `albums` + `profiles`, same normalization helpers) already inline in `home-feed.tsx`. Called by the client component once per qualifying realtime event. Consistent with the `actions.ts`-per-domain pattern used everywhere else (`notifications`, `likes`, `comments`, `profiles`, `follows`) — this is the first `src/lib/reviews/` module, since review reads have otherwise always lived inline in whichever page/component needed them.
7. **Notification badge — small client wrapper, not a client-driven Sidebar**: `Sidebar` stays an `async` Server Component computing an initial `unreadCount` exactly as it does today. Only the badge itself becomes a new client component (e.g. `NotificationBadge`), receiving the server-computed count as a starting prop and bumping it locally on realtime INSERT events targeting the viewer (`recipient_id=eq.<user.id>`). Avatar/profile rendering in `Sidebar` is untouched.
8. **Independent realtime channels**: the feed's `reviews` subscription and the badge's `notifications` subscription are two separate `.channel()` calls, each owned by the component that needs it (mounted only on the home page vs. mounted globally in the sidebar). No shared context/provider — not worth the plumbing for two independent, differently-scoped concerns.
9. **Reviews RLS / realtime trust model**: `reviews` already has a public `using (true)` select policy (same as the existing `/album` pages), so subscribing to all `reviews` INSERTs and filtering client-side via the realtime `in.()` filter param leaks nothing not already public. `notifications` already RLS-scopes `select` to `auth.uid() = recipient_id`, so a client subscribing as the authenticated user only ever receives their own rows regardless of filter — the realtime filter there is a redundant-but-harmless belt-and-suspenders, not the security boundary.
10. **Reconnect handling — badge only**: on the notification channel's reconnect (`SUBSCRIBED` firing again after a prior disconnect), re-fetch `getUnreadNotificationCount()` once (already an existing server action) to correct for any events missed while offline. The feed banner does **not** need this — a missed "new review" during a brief disconnect is a soft hint, not a count of record, and resolves naturally on the next full page load/navigation.

## Approach

### 1. Migration: enable Realtime

New migration (e.g. `supabase/migrations/<ts>_enable_realtime_feed_notifications.sql`):

```sql
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.notifications;
```

### 2. `src/lib/reviews/actions.ts` (new)

`getFeedReviewById(reviewId: string)` — `'use server'`, fetches one `reviews` row joined with `albums`/`profiles`, reusing the same field list and `normalizeAlbum`/`normalizeAuthor`-equivalent shaping as `home-feed.tsx`. Returns `null` if not found (e.g. deleted between event and fetch) or RLS-excluded.

### 3. `src/components/home/feed-card.tsx` (extracted)

Move the `FeedItem` type, `AlbumRef`/`AuthorRef`, `normalizeAlbum`/`normalizeAuthor`, `formatDate`, and the `FeedCard` component itself out of `home-feed.tsx` into their own module, so both the server-rendered initial list and the new client-side live-list wrapper can share them without a server/client import boundary violation.

### 4. `src/components/home/live-feed.tsx` (new, `'use client'`)

- Props: `initialItems: FeedItem[]`, `initialLikedReviewIds: string[]`, `feedProfileIds: string[]`, `userId: string`.
- Holds `items` state (seeded from `initialItems`) and `pendingCount` state (starts 0).
- On mount, opens one `supabase.channel(...)` (browser client from `@/lib/supabase/client`) subscribed to `postgres_changes` INSERT on `reviews`, filtered `profile_id=in.(feedProfileIds)`.
- On event: call `getFeedReviewById(payload.new.id)`. If `profile_id === userId`, prepend the result straight into `items`. Otherwise, cache it (e.g. in a ref keyed by id) and increment `pendingCount`.
- Renders the "N new reviews" banner above the list when `pendingCount > 0`; clicking it flushes the cached pending items (newest-first) into `items`, resets `pendingCount` to 0, and scrolls the feed container to top.
- Replaces the current inline `feedItems.map(...)` block in `home-feed.tsx`'s `<main>`.

### 5. `src/components/layout/notification-badge.tsx` (new, `'use client'`)

- Props: `initialCount: number`, `userId: string`.
- Local `count` state seeded from `initialCount`.
- Subscribes to `postgres_changes` INSERT on `notifications`, filtered `recipient_id=eq.<userId>`; increments `count` per event.
- On channel status transitioning back to `SUBSCRIBED` after a prior `CLOSED`/`CHANNEL_ERROR`, calls `getUnreadNotificationCount()` (existing server action) and replaces `count` with the fresh value.
- `sidebar.tsx` swaps the current inline `<NotificationCountBadge count={unreadCount} />` render for `<NotificationBadge initialCount={unreadCount} userId={user.id} />`, only when `href === '/notifications'` and there's a signed-in user (unauthenticated Sidebar render path is untouched).

### 6. Tests

- Vitest + RTL for `NotificationBadge`: renders initial count, bumps on a mocked realtime INSERT event, re-fetches on simulated reconnect.
- Vitest + RTL for `live-feed.tsx`: self-authored INSERT auto-inserts without a banner; followed-user INSERT increments the banner and only inserts on click; click scrolls to top (assert `scrollIntoView`/`scrollTo` call, whichever the implementation uses).

## Known follow-ups (not in this change)

- Diary entries remain excluded from both the feed's initial render and its live updates — pre-existing scope cut (`// since these look EXACTLY like reviews, we won't show them`), not reopened here.
- No shared realtime provider/context — if a third live-updating surface shows up later, revisit decision 8 (independent channels) then, rather than speculatively building shared plumbing now.
- `alter publication supabase_realtime add table public.reviews` publishes all DML (INSERT/UPDATE/DELETE), but `LiveFeed` only listens for INSERT — every like/comment on a review (which bumps `reviews.like_count`/`comment_count` via existing triggers) broadcasts an unused UPDATE event to every connected feed subscriber. PostgreSQL 15+ supports per-table `WITH (publish = 'insert')` to narrow this, but applying it here wasn't verified against this project's actual linked Postgres version in this session (no local/linked instance available to test against) — worth doing once it can be verified against `supabase db push` directly, rather than risking an unverified migration.
- The realtime subscription filter (`profile_id=in.(feedProfileIds)` in `live-feed.tsx`) is a plain string built from every followed id with no length cap, and doesn't re-subscribe if the viewer follows someone new mid-session (it's wired once, from the server-rendered `feedProfileIds` snapshot, via the effect's dependency array). Both are consequences of decision 3 (scope matches the current feed query) and are fine at MVP follow-counts, but would need revisiting if/when a user's follow list grows large enough to hit Realtime's practical filter-length limits, or if "see a new follow's posts live without refreshing" becomes a requirement.
- `pendingItemsRef`/`items` have no upper bound — a long-lived tab during a very active session accumulates an unbounded backlog (mirroring the pre-existing `.slice(0, 25)` cap on the initial server-rendered batch, which live-arrived items aren't subject to). Not addressed here since it requires an active session lasting long enough to matter, which is an edge case for the current user base.
