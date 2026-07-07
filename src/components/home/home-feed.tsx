import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { SpoilerReview } from '@/app/profile/[username]/spoiler-review'
import { WhoToFollowList, type FollowSuggestion } from './who-to-follow-list'
import { HomeSearchTrigger } from './home-search-trigger'
import { FollowButton } from './follow-button'

type AlbumRef = {
  id: string
  title: string
  artist: string
  cover_url: string | null
}

type AuthorRef = {
  username: string | null
  avatar_url: string | null
}

type FeedItem =
  | {
      kind: 'review'
      id: string
      createdAt: string
      rating: number
      content: string | null
      isSpoiler: boolean
      likeCount: number
      commentCount: number
      album: AlbumRef
      author: AuthorRef
    }
  | {
      kind: 'diary'
      id: string
      createdAt: string
      rating: number | null
      listenedDate: string
      album: AlbumRef
      author: AuthorRef
    }

/** Reviews/diary_entries come back with `albums(...)` joined; Postgrest can shape a
 *  many-to-one relation as either an object or a single-item array depending on
 *  inference, so normalize defensively (same pattern as profile/[username]/page.tsx). */
function normalizeAlbum(value: unknown): AlbumRef | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const album = raw as Record<string, unknown>
  if (typeof album.id !== 'string' || typeof album.title !== 'string' || typeof album.artist !== 'string') {
    return null
  }
  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    cover_url: typeof album.cover_url === 'string' ? album.cover_url : null,
  }
}

function normalizeAuthor(value: unknown): AuthorRef | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const profile = raw as Record<string, unknown>
  return {
    username: typeof profile.username === 'string' ? profile.username : null,
    avatar_url: typeof profile.avatar_url === 'string' ? profile.avatar_url : null,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

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
      .select(
        'id, rating, content, is_spoiler, created_at, like_count, comment_count, profile_id, profiles(username, avatar_url), albums(id, title, artist, cover_url)',
      )
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
          {feedItems.length === 0 ? (
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
          ) : (
            <>
              {followingIds.length === 0 && (
                <FollowNudgeBanner suggestions={whoToFollowData} />
              )}
              {feedItems.map((item) => (
                <FeedCard key={`${item.kind}-${item.id}`} item={item} liked={item.kind === 'review' && likedReviewIds.has(item.id)} />
              ))}
            </>
          )}
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
      <span className="font-punk-mono text-[11px] text-ink-600 shrink-0">You&apos;re not following anyone yet →</span>
      {suggestions.map((profile) => (
        <div key={profile.id} className="flex items-center gap-1.5 shrink-0">
          {profile.username ? (
            <Link href={`/profile/${profile.username}`} className="font-punk-mono font-bold text-[11.5px] hover:underline">
              {profile.username}
            </Link>
          ) : (
            <span className="font-punk-mono font-bold text-[11.5px]">listener</span>
          )}
          <FollowButton profileId={profile.id} initialIsFollowing={false} />
        </div>
      ))}
    </div>
  )
}

function FeedCard({ item, liked }: { item: FeedItem; liked: boolean }) {
  return (
    <div className="grid grid-cols-[126px_1fr] gap-4.5 bg-paper border-punk border-black shadow-hard-6-blue p-3.5 text-ink">
      <Link href={`/album/${item.album.id}`} className="relative w-31.5 h-31.5 border-2 border-black bg-ink-800 shrink-0">
        {item.album.cover_url && <Image src={item.album.cover_url} alt="" fill sizes="126px" className="object-cover" />}
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-punk-mono text-[11px] text-ink-600 mb-1.5">
          <span className="w-4.5 h-4.5 rounded-full bg-brand-blue border border-black shrink-0" />
          {item.author.username ? (
            <Link href={`/profile/${item.author.username}`} className="hover:underline">
              <b className="text-ink">{item.author.username}</b>
            </Link>
          ) : (
            <b className="text-ink">someone</b>
          )}
          <span className="text-ink-500">
            {item.kind === 'review' ? 'RATED' : 'LOGGED'} · {formatDate(item.createdAt)}
          </span>
        </div>
        <Link href={`/album/${item.album.id}`}>
          <div className="font-display text-lg leading-none">{item.album.title}</div>
          <div className="text-ink-600 font-punk-mono text-[11px] my-1">{item.album.artist}</div>
        </Link>
        {item.rating != null && (
          <div className="mb-2">
            <StarRating rating={item.rating} />
          </div>
        )}
        {item.kind === 'review' && item.content && (
          item.isSpoiler ? (
            <SpoilerReview content={item.content} />
          ) : (
            <p className="m-0 text-[12.5px] leading-normal text-ink-800 max-w-105 line-clamp-2">{item.content}</p>
          )
        )}
        {item.kind === 'review' && (
          <div className="flex items-center gap-4 mt-2.5">
            <LikeButton reviewId={item.id} initialLiked={liked} initialCount={item.likeCount} />
            <Link
              href={`/album/${item.album.id}#review-${item.id}`}
              className="font-punk-mono text-[11px] text-ink-500 flex items-center gap-1 cursor-pointer"
            >
              💬 {item.commentCount}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
