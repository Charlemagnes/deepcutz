# Phase 4: Social & Discovery (+ Notifications pulled forward from Phase 5)

## Context

Phase 3 shipped logging, reviewing, album pages, search, and profiles. The schema for social features (`follows`, `likes`, `comments`) has been live since the Supabase Auth migration, but almost none of it has UI: `follows` has partial plumbing (a toggle action + button + counts), while `likes`/`comments` are pure unused schema. The Home feed is currently a global "fresh tapes" firehose with no relation to who you follow, `/notifications` is a static "Coming soon" stub, and the sidebar already has an unused `badge` slot on its NOTIF link waiting to be wired up.

This phase closes out the MVP roadmap (Phase 4: activity feed, follow system, likes & comments) and pulls the Phase 5 notifications item forward, since a working social loop (follow/like/comment) isn't very motivating without something telling you it happened. Scope was narrowed with the user up front: notifications are in-app only (no email/push), the unread badge refreshes on navigation (no realtime), likes/comments/notifications apply to **reviews only** (no album-liking UI this phase), and Home is being replaced outright by a followed-users feed rather than kept as a second global feed alongside `/explore`.

## Approach

### 1. Database (two new additive migrations — never edit the superseded ones)

**`supabase/migrations/20260707010000_create_notifications.sql`**
- `notifications`: `id uuid pk`, `recipient_id uuid fk->profiles`, `actor_id uuid fk->profiles`, `type text check in ('follow','like','comment')`, `review_id uuid fk->reviews nullable`, `comment_id uuid fk->comments nullable`, `read_at timestamptz nullable`, `created_at`. Check constraints: `actor_id <> recipient_id`, and a shape check tying `type` to which of `review_id`/`comment_id` must be set (follow: neither, like: review_id only, comment: both).
- Indexes on `(recipient_id, read_at)` and `(recipient_id, created_at desc)`.
- RLS: select/update own row only (`auth.uid() = recipient_id`). **No insert policy** — rows are only ever written by `security definer` trigger functions (same mechanism already proven by `update_album_rating_stats()` in `20260706225300_supabase_auth_migration.sql`), so a liker's RLS-scoped session can still create a notification row owned by the review author.
- Three `security definer` trigger functions, mirroring the existing pattern (`language plpgsql security definer set search_path = public`):
  - `notify_on_follow()` — after insert on `follows` → recipient = `following_id`, actor = `follower_id`.
  - `notify_on_review_like()` — after insert on `likes` **when (new.target_type = 'review')** → look up the review's `profile_id`; skip if it's a self-like; insert with `review_id` set.
  - `notify_on_comment()` — after insert on `comments` → look up the parent review's `profile_id`; skip if self-comment; insert with both `review_id` and `comment_id`.

**`supabase/migrations/20260707020000_add_review_engagement_counts.sql`**
- `reviews.like_count int default 0`, `reviews.comment_count int default 0` — denormalized the same way `albums.avg_rating`/`rating_count` already are, so every listing page gets counts for free off the existing `reviews` select with no N+1 queries.
- `security definer` triggers `update_review_like_count()` (after insert/delete on `likes`, no-op unless `target_type = 'review'`) and `update_review_comment_count()` (after insert/delete on `comments`), each recomputing the count on the affected review.

After both are pushed (`supabase db push`), regenerate `src/lib/database.types.ts` via `supabase gen types typescript --linked` — never hand-edit it.

### 2. Fix the follow-button state bug (prerequisite for Phase 4 item 2)

`src/components/home/follow-button.tsx` currently does `useState(false)` unconditionally — it doesn't know if you already follow the profile. Add an `initialIsFollowing: boolean` prop and seed state from it. `src/app/profile/[username]/page.tsx` gains one more query (only for logged-in non-owner viewers) checking whether a `follows` row already exists, and passes the result down. The home feed's "who to follow" widget can pass `initialIsFollowing={false}` explicitly (it already filters out already-followed profiles).

### 3. Replace Home with a followed-users activity feed

Rewrite `src/components/home/home-feed.tsx` (same export/path, so `src/app/page.tsx` is untouched):
- Fetch `following_id`s for the current user. If empty, render an empty-state panel in the main content area (not just the sidebar) with a CTA and the "who to follow" list inline so brand-new users can act immediately.
- Otherwise fetch `reviews` + `diary_entries` where `profile_id in (followingIds)`, merge into the same discriminated-union shape already used in `profile/[username]/page.tsx`'s `ActivityItem` type (extended with the author's `profiles` embed), sort by `created_at` desc, cap at ~25.
- Keep the "WHO 2 FOLLOW" right-rail widget (ongoing utility, not just first-run). Drop "NEW TAPES" — it's a global-discovery widget that duplicates `/explore`'s job and doesn't belong on a feed defined by "people you follow."
- Fix a pre-existing parity gap while touching this: today's Home cards ignore `is_spoiler`; the rewritten feed should blur spoiler content the same way `review-item.tsx`/profile page already do.
- Render `LikeButton` + comment-count on these cards too, for consistency with Explore/album/profile — this is cheap once the components exist (see below) and avoids Home looking inconsistent with everything else.

### 4. Likes on reviews

New `src/lib/likes/actions.ts` — `toggleLike(reviewId)`, mirroring the check-existing → insert-or-delete shape of `src/lib/follows/actions.ts::toggleFollow`, returning `{ liked, likeCount }` (re-read `reviews.like_count` after the trigger updates it).

New `src/components/likes/like-button.tsx` — client component (`useTransition`, same shape as `FollowButton`), props `{ reviewId, initialLiked, initialCount }`, renders `♡/♥ {count}`.

Rendered in four places:
- `src/app/album/[id]/review-item.tsx` (+ `page.tsx` passing `id`, `like_count`, `comment_count`, and a batched "did I like these" query) — not currently Link-wrapped, so this is a straightforward addition. Also add a DOM anchor `id="review-{id}"` here for notification deep-links.
- `src/app/explore/page.tsx` — **requires restructuring first**: review cards currently wrap the entire card in `<Link href="/album/...">`, which can't contain nested interactive buttons. Change to an outer `<div>`/`HardShadowCard` with the `<Link>` scoped to just the thumbnail/title block (mirroring how `profile/[username]/page.tsx` already does it), then replace the dead `♡ 0`/`💬 0` placeholders with real components.
- `src/app/profile/[username]/page.tsx`'s `reviewsWithContent` cards — no structural change needed, its `<Link>` is already scoped correctly.
- The rewritten Home feed (§3) — same restructuring caveat as Explore applies if its cards are still Link-wrapped.

### 5. Comments on reviews

New `src/lib/comments/actions.ts` — `listComments(reviewId)`, `addComment(reviewId, content)` (trim, reject empty/>1000 chars), `deleteComment(commentId)` (own-only, matching RLS). Normalize the `profiles` embed defensively the same way `normalizeAlbum` does in the profile page.

New `src/components/comments/comment-section.tsx` (expandable container, lazy-loads `listComments` only on first expand — avoids fetching threads for every review in a list up front) and `src/components/comments/comment-form.tsx` (isolated textarea + submit, matching the existing pattern of small testable inputs like `star-rating-input.tsx`).

**Scope**: full inline thread (list + form) renders only on the album page (`review-item.tsx`) — that's the canonical detail view. Explore/profile/Home show a `💬 {count}` badge that deep-links to `/album/{id}#review-{id}` rather than duplicating a full thread UI in four places.

### 6. Notifications page + sidebar badge

New `src/lib/notifications/actions.ts`:
- `listNotifications()` — select from `notifications` with **disambiguated** embeds (two FKs to `profiles` means `profiles!notifications_actor_id_fkey(...)` is required), joined through to the review's album title/artist for the display copy. Capture `isUnread` (`read_at === null`) per row before marking read.
- `markAllNotificationsRead()` — bulk update `read_at = now()` where still null, called by the page after capturing the list (so the current render still shows what was unread, but the badge clears for the next navigation).
- `getUnreadNotificationCount()` — `count: 'exact', head: true` where `read_at is null`, used by the sidebar.

Rewrite `src/app/notifications/page.tsx` to render real rows via a new `src/app/notifications/notification-row.tsx` (pure presentational, one branch per `type` for the message copy + link target: follow → profile, like/comment → album anchor). Reuse `HardShadowCard` and the existing zine visual language; unread rows get a visual accent.

Modify `src/components/layout/sidebar.tsx` — add `getUnreadNotificationCount()` to its existing `if (user)` block, and wire a small red count-chip into the already-unused `badge` prop on the NOTIF `SidebarNavLink`. No changes needed to `layout.tsx` — `Sidebar` is already a self-contained async Server Component.

### 7. Tests (matching existing Vitest + RTL conventions)

- `follow-button.test.tsx` — regression test for the initial-state fix.
- `like-button.test.tsx` — initial render, click toggles via mocked `toggleLike`, disabled mid-transition.
- `comment-form.test.tsx` — disabled when empty, calls mocked `addComment` with trimmed content, clears on success.
- `comment-section.test.tsx` — collapsed shows count only (no fetch); expanding fetches once; adding appends without a re-fetch.
- `notification-row.test.tsx` — one case per `type` for copy/link correctness, plus unread-styling case.
- `sidebar-nav-link.test.tsx` — badge renders when passed, omitted when undefined.

## Critical files

- `supabase/migrations/20260706225300_supabase_auth_migration.sql` — reference for RLS/trigger conventions to replicate (`security definer`, public read + owner write).
- `src/lib/follows/actions.ts`, `src/components/home/follow-button.tsx` — pattern to mirror for likes; also the bug to fix.
- `src/components/home/home-feed.tsx`, `src/app/explore/page.tsx`, `src/app/album/[id]/page.tsx` + `review-item.tsx`, `src/app/profile/[username]/page.tsx` — the four review-rendering surfaces to touch.
- `src/components/layout/sidebar.tsx`, `src/components/layout/sidebar-nav-link.tsx` — badge wiring.
- `src/app/notifications/page.tsx` — stub being replaced.
- `src/lib/database.types.ts` — regenerate after migrations, don't hand-edit.

## Verification

- `pnpm lint`, `pnpm test`, `pnpm build` must all pass (matches CI).
- `supabase db push` applies both new migrations cleanly against the linked project; regenerate types afterward and confirm `notifications`/`reviews.like_count`/`reviews.comment_count` appear in `database.types.ts`.
- Manual end-to-end pass with two test accounts: A follows B → A's Home shows B's existing reviews/logs, B gets a follow notification and sidebar badge increments; A likes B's review → count updates on every surface it's rendered (album/explore/profile/home), B gets a notification; A comments on B's review → count updates, comment appears in the album-page thread, B gets a notification with correct deep-link; visiting `/notifications` clears the badge on next navigation; self-like/self-comment on your own review does not generate a notification; a brand-new account with zero follows sees the Home empty-state with working inline follow suggestions.
