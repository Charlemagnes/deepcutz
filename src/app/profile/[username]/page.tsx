import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { FollowButton } from '@/components/home/follow-button'
import { LikeButton } from '@/components/likes/like-button'
import { StarRating } from '@/components/marketing/star-rating'
import { HardShadowCard } from '@/components/marketing/hard-shadow-card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'
import { SpoilerReview } from './spoiler-review'

type AlbumRef = {
  id: string
  title: string
  artist: string
  cover_url: string | null
}

type ActivityItem =
  | {
      kind: 'review'
      id: string
      createdAt: string
      rating: number
      album: AlbumRef
    }
  | {
      kind: 'diary'
      id: string
      createdAt: string
      rating: number | null
      listenedDate: string
      album: AlbumRef
    }

type ReviewWithContent = {
  id: string
  rating: number
  content: string
  isSpoiler: boolean
  createdAt: string
  likeCount: number
  commentCount: number
  album: AlbumRef
}

/** Reviews/diary_entries come back with `albums(...)` joined; Postgrest can shape a
 *  many-to-one relation as either an object or a single-item array depending on
 *  inference, so normalize defensively (same pattern as home-feed.tsx). */
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const supabase = await createClient()
  const [currentUser, { data: profile }] = await Promise.all([
    getCurrentUser(),
    supabase.from('profiles').select('id, username, display_name, avatar_url, created_at').eq('username', username).maybeSingle(),
  ])

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div
          className="font-display text-2xl mb-3"
          style={{ color: 'var(--color-brand-red)', textShadow: '3px 3px 0 var(--color-brand-blue)', rotate: '-1deg' }}
        >
          USER NOT FOUND
        </div>
        <p className="font-punk-mono text-sm text-ink-500 max-w-sm">
          Nobody&apos;s logged in as @{username} — check the spelling, or they may have deleted their account.
        </p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const shouldCheckFollowing = !!currentUser && !isOwnProfile

  const [
    { count: followerCount },
    { count: followingCount },
    { data: recentReviews },
    { data: recentDiary },
    { data: topReviews },
    { data: contentReviews },
    { data: followRow },
  ] = await Promise.all([
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase
      .from('reviews')
      .select('id, rating, created_at, albums(id, title, artist, cover_url)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('diary_entries')
      .select('id, rating, listened_date, created_at, albums(id, title, artist, cover_url)')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('reviews')
      .select('id, rating, created_at, albums(id, title, artist, cover_url)')
      .eq('profile_id', profile.id)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('reviews')
      .select('id, rating, content, is_spoiler, like_count, comment_count, created_at, albums(id, title, artist, cover_url)')
      .eq('profile_id', profile.id)
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20),
    shouldCheckFollowing
      ? supabase.from('follows').select('id').eq('follower_id', currentUser!.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const activityItems: ActivityItem[] = [
    ...(recentReviews ?? []).flatMap((r) => {
      const album = normalizeAlbum(r.albums)
      if (!album) return []
      return [{ kind: 'review' as const, id: r.id, createdAt: r.created_at, rating: r.rating, album }]
    }),
    ...(recentDiary ?? []).flatMap((d) => {
      const album = normalizeAlbum(d.albums)
      if (!album) return []
      return [
        {
          kind: 'diary' as const,
          id: d.id,
          createdAt: d.created_at,
          rating: d.rating,
          listenedDate: d.listened_date,
          album,
        },
      ]
    }),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, 15)

  const diaryHistory = (recentDiary ?? []).flatMap((d) => {
    const album = normalizeAlbum(d.albums)
    if (!album) return []
    return [{ id: d.id, createdAt: d.created_at, rating: d.rating, listenedDate: d.listened_date, album }]
  })

  const topAlbums = (topReviews ?? []).flatMap((r) => {
    const album = normalizeAlbum(r.albums)
    if (!album) return []
    return [{ id: r.id, rating: r.rating, album }]
  })

  const reviewsWithContent: ReviewWithContent[] = (contentReviews ?? []).flatMap((r) => {
    const album = normalizeAlbum(r.albums)
    if (!album || !r.content || !r.content.trim()) return []
    return [
      {
        id: r.id,
        rating: r.rating,
        content: r.content,
        isSpoiler: r.is_spoiler,
        createdAt: r.created_at,
        likeCount: r.like_count ?? 0,
        commentCount: r.comment_count ?? 0,
        album,
      },
    ]
  })

  const reviewIds = reviewsWithContent.map((r) => r.id)
  const { data: likedRows } =
    currentUser && reviewIds.length > 0
      ? await supabase
          .from('likes')
          .select('target_id')
          .eq('profile_id', currentUser.id)
          .eq('target_type', 'review')
          .in('target_id', reviewIds)
      : { data: [] as { target_id: string }[] }
  const likedIds = new Set((likedRows ?? []).map((l) => l.target_id))

  const displayName = profile.display_name || profile.username
  const initial = (displayName ?? '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-220 mx-auto px-6 sm:px-9 py-9 text-paper">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-9">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar source domain isn't guaranteed to be allowlisted, unlike album covers
            <img
              src={profile.avatar_url}
              alt=""
              className="w-72 h-72 rounded-full object-cover border-punk border-black shadow-hard-4-yellow"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-72 h-72 rounded-full border-punk border-black shadow-hard-4-yellow bg-brand-blue flex items-center justify-center font-display text-2xl text-ink"
            >
              {initial}
            </div>
          )}

          <div>
            <div
              className="font-display text-2xl w-fit"
              style={{ color: 'var(--color-brand-yellow)', textShadow: '3px 3px 0 var(--color-brand-red)', rotate: '-1deg' }}
            >
              {displayName}
            </div>
            <div className="font-punk-mono text-xs text-ink-500 mt-1">
              @{profile.username}
              {isOwnProfile && <span className="ml-2 text-brand-cyan">(that&apos;s you)</span>}
            </div>
            <div className="flex gap-4 mt-2 font-punk-mono text-xs text-ink-200">
              <span>
                <b className="text-paper">{followerCount ?? 0}</b> followers
              </span>
              <span>
                <b className="text-paper">{followingCount ?? 0}</b> following
              </span>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <FollowButton profileId={profile.id} initialIsFollowing={!!followRow} />
        )}
      </div>

      {/* Recent activity */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="blue">RECENT ACTIVITY</SectionHeading>
        </div>
        {activityItems.length === 0 ? (
          <EmptyState>
            {isOwnProfile ? "You haven't logged anything yet — go spin a record." : 'No activity yet.'}
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3.5">
            {activityItems.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={`/album/${item.album.id}`}
                className="grid grid-cols-[54px_1fr] gap-3.5 bg-paper border-2 border-black shadow-hard-4-blue p-3 text-ink"
              >
                <AlbumCoverThumb src={item.album.cover_url} sizePx={54} sizes="54px" />
                <div className="min-w-0">
                  <div className="font-punk-mono text-10-5 text-ink-600 mb-0.5">
                    {item.kind === 'review' ? 'RATED' : 'LOGGED'} · {formatDate(item.createdAt)}
                  </div>
                  <div className="font-display text-13-5 leading-tight truncate">
                    {item.album.title}
                  </div>
                  <div className="text-ink-600 font-punk-mono text-10-5 truncate">
                    {item.album.artist}
                  </div>
                  {item.rating != null && (
                    <div className="mt-1">
                      <StarRating rating={item.rating} size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Top albums */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="yellow">TOP ALBUMS</SectionHeading>
        </div>
        {topAlbums.length === 0 ? (
          <EmptyState>No rated albums yet.</EmptyState>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5">
            {topAlbums.map(({ id, rating, album }) => (
              <Link key={id} href={`/album/${album.id}`} className="group">
                <div className="relative aspect-square border-2 border-black shadow-hard-3-red bg-ink-800">
                  {album.cover_url && (
                    <Image src={album.cover_url} alt="" fill sizes="120px" className="object-cover" />
                  )}
                </div>
                <div className="font-punk-mono text-10-5 font-bold mt-1.5 truncate">
                  {album.title}
                </div>
                <StarRating rating={rating} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="red">{isOwnProfile ? 'YOUR REVIEWS' : `${profile.username}'S REVIEWS`}</SectionHeading>
        </div>
        {reviewsWithContent.length === 0 ? (
          <EmptyState>No reviews written yet.</EmptyState>
        ) : (
          <div className="flex flex-col gap-3.5">
            {reviewsWithContent.map((review) => (
              <HardShadowCard key={review.id} accent="cyan" border={2} shadow={5} className="p-4">
                <Link href={`/album/${review.album.id}`} className="flex items-center gap-3 mb-2.5">
                  <AlbumCoverThumb src={review.album.cover_url} sizePx={42} sizes="42px" />
                  <div className="min-w-0">
                    <div className="font-display text-sm leading-tight truncate">
                      {review.album.title}
                    </div>
                    <div className="text-ink-600 font-punk-mono text-10-5 truncate">
                      {review.album.artist}
                    </div>
                  </div>
                </Link>
                <div className="mb-2">
                  <StarRating rating={review.rating} />
                </div>
                {review.isSpoiler ? (
                  <SpoilerReview content={review.content} />
                ) : (
                  <p className="m-0 text-12-5 leading-normal text-ink-800 whitespace-pre-wrap">
                    {review.content}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2.5">
                  <LikeButton
                    reviewId={review.id}
                    initialLiked={likedIds.has(review.id)}
                    initialCount={review.likeCount}
                  />
                  <Link
                    href={`/review/${review.id}`}
                    className="text-11 text-ink-500 font-punk-mono"
                  >
                    💬 {review.commentCount}
                  </Link>
                </div>
              </HardShadowCard>
            ))}
          </div>
        )}
      </section>

      {/* Diary / history */}
      <section>
        <div className="mb-4">
          <SectionHeading accent="cyan">DIARY</SectionHeading>
        </div>
        {diaryHistory.length === 0 ? (
          <EmptyState>No diary entries yet.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {diaryHistory.map((entry) => (
              <Link
                key={entry.id}
                href={`/album/${entry.album.id}`}
                className="flex items-center gap-3 bg-ink-900 border border-ink-800 px-3 py-2"
              >
                <div className="relative w-8.5 h-8.5 border border-ink-800 bg-ink-800 shrink-0">
                  {entry.album.cover_url && (
                    <Image src={entry.album.cover_url} alt="" fill sizes="34px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-punk-mono font-bold text-11-5 truncate">
                    {entry.album.title}
                  </div>
                  <div className="text-ink-500 font-punk-mono text-10 truncate">
                    {entry.album.artist}
                  </div>
                </div>
                {entry.rating != null && <StarRating rating={entry.rating} size="sm" />}
                <div className="font-punk-mono text-10 text-ink-500 shrink-0">
                  {formatDate(entry.listenedDate)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-punk-mono text-sm text-ink-500">{children}</p>
  )
}
