import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { WhoToFollowList, type FollowSuggestion } from './who-to-follow-list'
import { HomeSearchTrigger } from './home-search-trigger'
import { FollowButton } from './follow-button'
import { LiveFeed } from './live-feed'
import { normalizeAlbum, normalizeAuthor, REVIEW_FEED_SELECT, type FeedItem } from './feed-card'

export async function HomeFeed() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  const { data: followRows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user!.id)

  const followingIds = (followRows ?? []).map((f) => f.following_id)
  const followingIdSet = new Set(followingIds)

  const { data: suggestions } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', user!.id)
    .order('created_at', { ascending: false })
    .limit(8)

  const whoToFollow = (suggestions ?? []).filter((p) => !followingIdSet.has(p.id)).slice(0, 3)
  const reviewCounts = await Promise.all(
    whoToFollow.map((p) => supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('profile_id', p.id)),
  )
  const whoToFollowData = whoToFollow.map((profile, i) => ({
    id: profile.id,
    username: profile.username,
    reviewCount: reviewCounts[i]?.count ?? 0,
  }))

  let feedItems: FeedItem[] = []
  let likedReviewIds = new Set<string>()

  const feedProfileIds = [...followingIds, user!.id]

  const [{ data: reviews }, { data: diaryEntries }] = await Promise.all([
    supabase
      .from('reviews')
      .select(REVIEW_FEED_SELECT)
      .in('profile_id', feedProfileIds)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('diary_entries')
      .select(
        'id, rating, listened_date, created_at, profile_id, profiles(username, avatar_url), albums(id, title, artist, cover_url)',
      )
      .in('profile_id', feedProfileIds)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const reviewIds = (reviews ?? []).map((r) => r.id)
  if (reviewIds.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('profile_id', user!.id)
      .eq('target_type', 'review')
      .in('target_id', reviewIds)
    likedReviewIds = new Set((likes ?? []).map((l) => l.target_id))
  }

  feedItems = [
    ...(reviews ?? []).flatMap((r) => {
      const album = normalizeAlbum(r.albums)
      const author = normalizeAuthor(r.profiles)
      if (!album || !author) return []
      return [
        {
          kind: 'review' as const,
          id: r.id,
          createdAt: r.created_at,
          rating: r.rating,
          content: r.content,
          isSpoiler: r.is_spoiler,
          likeCount: r.like_count,
          commentCount: r.comment_count,
          album,
          author,
        },
      ]
    }),
    // since these look EXACTLY like reviews, we won't show them. todo: create a separate "diary" card component and re-enable this.
    // ...(diaryEntries ?? []).flatMap((d) => {
    //   const album = normalizeAlbum(d.albums)
    //   const author = normalizeAuthor(d.profiles)
    //   if (!album || !author) return []
    //   return [
    //     {
    //       kind: 'diary' as const,
    //       id: d.id,
    //       createdAt: d.created_at,
    //       rating: d.rating,
    //       listenedDate: d.listened_date,
    //       album,
    //       author,
    //     },
    //   ]
    // }),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, 25)

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-[1fr_300px]">
      <main className="overflow-hidden">
        <div className="sticky top-0 z-10 px-6 sm:px-9 pt-6 pb-3.5 bg-ink">
          <div
            className="font-display text-2xl w-fit"
            style={{ color: 'var(--color-brand-yellow)', textShadow: '3px 3px 0 var(--color-brand-red)', rotate: '-1deg' }}
          >
            FRESH TAPES
          </div>
        </div>

        <div className="px-6 sm:px-9 pb-9 flex flex-col gap-5">
          <LiveFeed
            initialItems={feedItems}
            likedReviewIds={likedReviewIds}
            feedProfileIds={feedProfileIds}
            userId={user!.id}
            emptyState={
              <div className="flex flex-col gap-6">
                <div>
                  <div
                    className="font-display text-xl w-fit mb-2"
                    style={{ color: 'var(--color-brand-yellow)', textShadow: '3px 3px 0 var(--color-brand-red)', rotate: '-1deg' }}
                  >
                    YOUR FEED IS EMPTY
                  </div>
                  <p className="font-punk-mono text-sm text-ink-500 max-w-md">
                    You and the people you follow haven&apos;t logged anything yet. Here&apos;s a few listeners to get
                    you started.
                  </p>
                </div>
                <WhoToFollowList suggestions={whoToFollowData} variant="panel" />
              </div>
            }
            followNudge={followingIds.length === 0 ? <FollowNudgeBanner suggestions={whoToFollowData} /> : null}
          />
        </div>
      </main>

      <aside className="border-l-punk border-paper px-4 py-5.5 hidden xl:flex flex-col gap-6.5">
        <HomeSearchTrigger />

        <WhoToFollowList suggestions={whoToFollowData} variant="sidebar" />
      </aside>
    </div>
  )
}

/** Slim nudge shown above a non-empty feed when the viewer follows nobody (e.g. they
 *  only have their own reviews so far) — distinct from the full-panel WhoToFollowList
 *  shown when the feed has nothing at all. */
function FollowNudgeBanner({ suggestions }: { suggestions: FollowSuggestion[] }) {
  if (suggestions.length === 0) return null

  return (
    <div className="flex items-center gap-3 bg-paper border-punk border-black shadow-hard-3-blue px-3.5 py-2.5 text-ink overflow-x-auto">
      <span className="font-punk-mono text-11 text-ink-600 shrink-0">You&apos;re not following anyone yet →</span>
      {suggestions.map((profile) => (
        <div key={profile.id} className="flex items-center gap-1.5 shrink-0">
          {profile.username ? (
            <Link href={`/profile/${profile.username}`} className="font-punk-mono font-bold text-11-5 hover:underline">
              {profile.username}
            </Link>
          ) : (
            <span className="font-punk-mono font-bold text-11-5">listener</span>
          )}
          <FollowButton profileId={profile.id} initialIsFollowing={false} />
        </div>
      ))}
    </div>
  )
}

