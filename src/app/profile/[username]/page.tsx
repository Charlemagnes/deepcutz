import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { FollowButton } from '@/components/home/follow-button'
import { SectionHeading } from '@/components/marketing/section-heading'
import { normalizeAlbum } from '@/lib/supabase/normalize'
import { ActivityList, type ActivityItem } from './activity-list'
import { TopAlbums, type TopAlbum } from './top-albums'
import { ReviewsList, type ReviewWithContent } from './reviews-list'
import { DiaryList, type DiaryEntry } from './diary-list'

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

  const diaryHistory: DiaryEntry[] = (recentDiary ?? []).flatMap((d) => {
    const album = normalizeAlbum(d.albums)
    if (!album) return []
    return [{ id: d.id, createdAt: d.created_at, rating: d.rating, listenedDate: d.listened_date, album }]
  })

  const topAlbums: TopAlbum[] = (topReviews ?? []).flatMap((r) => {
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

        {!isOwnProfile && <FollowButton profileId={profile.id} initialIsFollowing={!!followRow} />}
      </div>

      {/* Recent activity */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="blue">RECENT ACTIVITY</SectionHeading>
        </div>
        <ActivityList
          items={activityItems}
          emptyMessage={isOwnProfile ? "You haven't logged anything yet — go spin a record." : 'No activity yet.'}
        />
      </section>

      {/* Top albums */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="yellow">TOP ALBUMS</SectionHeading>
        </div>
        <TopAlbums albums={topAlbums} />
      </section>

      {/* Reviews */}
      <section className="mb-11">
        <div className="mb-4">
          <SectionHeading accent="red">{isOwnProfile ? 'YOUR REVIEWS' : `${profile.username}'S REVIEWS`}</SectionHeading>
        </div>
        <ReviewsList reviews={reviewsWithContent} likedIds={likedIds} emptyMessage="No reviews written yet." />
      </section>

      {/* Diary / history */}
      <section>
        <div className="mb-4">
          <SectionHeading accent="cyan">DIARY</SectionHeading>
        </div>
        <DiaryList entries={diaryHistory} />
      </section>
    </div>
  )
}
