import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { AttributionLine } from '@/components/marketing/attribution-line'
import { HARD_SHADOW_CLASSES } from '@/components/marketing/shadow-classes'
import type { Accent } from '@/components/marketing/types'
import { cn } from '@/lib/utils'

const ACCENT_HEX: Record<Accent, string> = {
  red: 'var(--color-brand-red)',
  blue: 'var(--color-brand-blue)',
  yellow: 'var(--color-brand-yellow)',
  cyan: 'var(--color-brand-cyan)',
}

const ACCENT_CYCLE: Accent[] = ['red', 'blue', 'yellow', 'cyan']

function relativeTime(dateString: string) {
  const then = new Date(dateString).getTime()
  const diffMs = Date.now() - then
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}w ago`
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SectionHeading({
  children,
  accent,
  shadow,
  rotate = -1,
}: {
  children: React.ReactNode
  accent: Accent
  shadow: Accent
  rotate?: number
}) {
  return (
    <h2
      className="font-display text-xl sm:text-2xl inline-block w-fit m-0"
      style={{
        color: ACCENT_HEX[accent],
        textShadow: `3px 3px 0 ${ACCENT_HEX[shadow]}`,
        rotate: `${rotate}deg`,
      }}
    >
      {children}
    </h2>
  )
}

export default async function ExplorePage() {
  const supabase = await createClient()

  const [{ data: trendingAlbums }, { data: recentReviews }, user] = await Promise.all([
    supabase
      .from('albums')
      .select('id, title, artist, cover_url, avg_rating, rating_count')
      .order('rating_count', { ascending: false })
      .limit(5),
    supabase
      .from('reviews')
      .select(
        'id, rating, content, created_at, like_count, comment_count, profiles(username, avatar_url), albums(id, title, artist, cover_url)',
      )
      .order('created_at', { ascending: false })
      .limit(8),
    getCurrentUser(),
  ])

  const albums = trendingAlbums ?? []
  const reviews = recentReviews ?? []

  const reviewIds = reviews.map((r) => r.id)
  const { data: likedRows } =
    user && reviewIds.length > 0
      ? await supabase
          .from('likes')
          .select('target_id')
          .eq('profile_id', user.id)
          .eq('target_type', 'review')
          .in('target_id', reviewIds)
      : { data: [] as { target_id: string }[] }
  const likedIds = new Set((likedRows ?? []).map((l) => l.target_id))

  return (
    <div className="min-h-screen bg-ink px-6 sm:px-9 py-7 flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <SectionHeading accent="yellow" shadow="red" rotate={-1}>
          🔥 TRENDING THIS WEEK
        </SectionHeading>

        {albums.length === 0 ? (
          <p className="font-punk-mono text-sm text-ink-500">
            No albums logged yet — be the first to review one and it&apos;ll show up here.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {albums.map((album, i) => {
              const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length]
              const rotate = i % 2 === 0 ? -1 : 1

              return (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  className={cn("bg-paper text-ink border-2 border-black p-2.5", HARD_SHADOW_CLASSES[4][accent])}
                  style={{ rotate: `${rotate}deg` }}
                >
                  <div className="relative aspect-square border-2 border-black bg-ink-500 mb-2 overflow-hidden">
                    {album.cover_url ? (
                      <Image
                        src={album.cover_url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-ink-200" />
                    )}
                  </div>
                  <div className="font-display text-13 leading-tight truncate">
                    {album.title}
                  </div>
                  <div className="font-punk-mono text-11 text-ink-600 truncate mt-0.5">
                    {album.artist}
                  </div>
                  <div className="font-punk-mono text-11 mt-1.5 flex items-center gap-1 text-ink-800">
                    <span style={{ color: '#c99a00' }}>★</span>
                    <span>{album.avg_rating.toFixed(1)}</span>
                    <span className="text-ink-500">· {album.rating_count} LOGS</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading accent="cyan" shadow="blue" rotate={1}>
          ⚡ POPULAR REVIEWS
        </SectionHeading>

        {reviews.length === 0 ? (
          <p className="font-punk-mono text-sm text-ink-500">
            No reviews yet — once people start logging albums, their reviews will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review, i) => {
              const album = Array.isArray(review.albums) ? review.albums[0] : review.albums
              const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
              if (!album || !profile) return null

              const shadowAccent = ACCENT_CYCLE[i % ACCENT_CYCLE.length]

              return (
                <div
                  key={review.id}
                  className={cn(
                    "grid grid-cols-[110px_1fr] gap-4 bg-paper text-ink border-2 border-black p-3",
                    HARD_SHADOW_CLASSES[4][shadowAccent]
                  )}
                >
                  <Link href={`/album/${album.id}`} className="block">
                    <div className="relative w-27.5 h-27.5 border-2 border-black bg-ink-500 overflow-hidden shrink-0">
                      {album.cover_url ? (
                        <Image src={album.cover_url} alt="" fill sizes="110px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-ink-200" />
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0">
                    <AttributionLine
                      username={profile.username}
                      href={profile.username ? `/profile/${profile.username}` : undefined}
                      timestampLabel={`· ${relativeTime(review.created_at)}`}
                      accent={shadowAccent}
                    />
                    <Link href={`/album/${album.id}`} className="block">
                      <div className="font-display text-base leading-tight truncate">{album.title}</div>
                      <div className="font-punk-mono text-11 text-ink-600 truncate mt-0.5 mb-1.5">
                        {album.artist}
                      </div>
                    </Link>
                    <div className="mb-2">
                      <StarRating rating={review.rating} />
                    </div>
                    {review.content && (
                      <p className="m-0 text-12-5 leading-normal text-ink-800 max-w-130 line-clamp-2">
                        {review.content}
                      </p>
                    )}
                    <div className="font-punk-mono text-11 text-ink-500 mt-2 flex items-center gap-3">
                      <LikeButton
                        reviewId={review.id}
                        initialLiked={likedIds.has(review.id)}
                        initialCount={review.like_count}
                      />
                      <Link href={`/review/${review.id}`} className="text-11 text-ink-500 font-punk-mono">
                        💬 {review.comment_count}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
