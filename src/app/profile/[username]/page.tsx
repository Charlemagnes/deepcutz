import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { FollowButton } from '@/components/home/follow-button'
import { StarRating } from '@/components/marketing/star-rating'
import { HardShadowCard } from '@/components/marketing/hard-shadow-card'
import { SectionHeading } from '@/components/marketing/section-heading'
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
          className="font-[family-name:var(--font-bungee)] text-2xl mb-3"
          style={{ color: '#ff2b2b', textShadow: '3px 3px 0 #2b6bff', rotate: '-1deg' }}
        >
          USER NOT FOUND
        </div>
        <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#9a9a9a] max-w-sm">
          Nobody&apos;s logged in as @{username} — check the spelling, or they may have deleted their account.
        </p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  const [
    { count: followerCount },
    { count: followingCount },
    { data: recentReviews },
    { data: recentDiary },
    { data: topReviews },
    { data: contentReviews },
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
      .select('id, rating, content, is_spoiler, created_at, albums(id, title, artist, cover_url)')
      .eq('profile_id', profile.id)
      .not('content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20),
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
        album,
      },
    ]
  })

  const displayName = profile.display_name || profile.username
  const initial = (displayName ?? '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-[880px] mx-auto px-6 sm:px-9 py-9 text-[#f2f2f2]">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-9">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar source domain isn't guaranteed to be allowlisted, unlike album covers
            <img
              src={profile.avatar_url}
              alt=""
              className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-black shadow-[4px_4px_0_#ffe000]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-[72px] h-[72px] rounded-full border-[3px] border-black shadow-[4px_4px_0_#ffe000] bg-[#2b6bff] flex items-center justify-center font-[family-name:var(--font-bungee)] text-2xl text-[#0a0a0a]"
            >
              {initial}
            </div>
          )}

          <div>
            <div
              className="font-[family-name:var(--font-bungee)] text-2xl w-fit"
              style={{ color: '#ffe000', textShadow: '3px 3px 0 #ff2b2b', rotate: '-1deg' }}
            >
              {displayName}
            </div>
            <div className="font-[family-name:var(--font-space-mono)] text-xs text-[#9a9a9a] mt-1">
              @{profile.username}
              {isOwnProfile && <span className="ml-2 text-[#2ee6ff]">(that&apos;s you)</span>}
            </div>
            <div className="flex gap-4 mt-2 font-[family-name:var(--font-space-mono)] text-xs text-[#d8d8d8]">
              <span>
                <b className="text-[#f2f2f2]">{followerCount ?? 0}</b> followers
              </span>
              <span>
                <b className="text-[#f2f2f2]">{followingCount ?? 0}</b> following
              </span>
            </div>
          </div>
        </div>

        {!isOwnProfile && <FollowButton profileId={profile.id} />}
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
                className="grid grid-cols-[54px_1fr] gap-3.5 bg-[#f2f2f2] border-2 border-black shadow-[4px_4px_0_#2b6bff] p-3 text-[#0a0a0a]"
              >
                <div className="relative w-[54px] h-[54px] border-2 border-black bg-[#333] shrink-0">
                  {item.album.cover_url && (
                    <Image src={item.album.cover_url} alt="" fill sizes="54px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-[family-name:var(--font-space-mono)] text-[10.5px] text-[#555] mb-0.5">
                    {item.kind === 'review' ? 'RATED' : 'LOGGED'} · {formatDate(item.createdAt)}
                  </div>
                  <div className="font-[family-name:var(--font-bungee)] text-[13.5px] leading-tight truncate">
                    {item.album.title}
                  </div>
                  <div className="text-[#555] font-[family-name:var(--font-space-mono)] text-[10.5px] truncate">
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
                <div className="relative aspect-square border-2 border-black shadow-[3px_3px_0_#ff2b2b] bg-[#333]">
                  {album.cover_url && (
                    <Image src={album.cover_url} alt="" fill sizes="120px" className="object-cover" />
                  )}
                </div>
                <div className="font-[family-name:var(--font-space-mono)] text-[10.5px] font-bold mt-1.5 truncate">
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
                  <div className="relative w-[42px] h-[42px] border-2 border-black bg-[#333] shrink-0">
                    {review.album.cover_url && (
                      <Image src={review.album.cover_url} alt="" fill sizes="42px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-[family-name:var(--font-bungee)] text-sm leading-tight truncate">
                      {review.album.title}
                    </div>
                    <div className="text-[#555] font-[family-name:var(--font-space-mono)] text-[10.5px] truncate">
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
                  <p className="m-0 text-[12.5px] leading-[1.5] text-[#1a1a1a] whitespace-pre-wrap">
                    {review.content}
                  </p>
                )}
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
                className="flex items-center gap-3 bg-[#141414] border border-[#333] px-3 py-2"
              >
                <div className="relative w-[34px] h-[34px] border border-[#333] bg-[#333] shrink-0">
                  {entry.album.cover_url && (
                    <Image src={entry.album.cover_url} alt="" fill sizes="34px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--font-space-mono)] font-bold text-[11.5px] truncate">
                    {entry.album.title}
                  </div>
                  <div className="text-[#8a8a8a] font-[family-name:var(--font-space-mono)] text-[10px] truncate">
                    {entry.album.artist}
                  </div>
                </div>
                {entry.rating != null && <StarRating rating={entry.rating} size="sm" />}
                <div className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#8a8a8a] shrink-0">
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
    <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#9a9a9a]">{children}</p>
  )
}
