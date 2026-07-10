import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listComments } from '@/lib/comments/actions'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { ReplyThread } from '@/components/comments/reply-thread'
import { WhoToFollowList } from '@/components/home/who-to-follow-list'
import { HomeSearchTrigger } from '@/components/home/home-search-trigger'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'

interface AlbumRef {
  id: string
  title: string
  artist: string
  cover_url: string | null
}

interface AuthorRef {
  username: string | null
  avatar_url: string | null
}

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

export default async function ReviewThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  const { data: review } = await supabase
    .from('reviews')
    .select(
      'id, rating, content, is_spoiler, created_at, like_count, comment_count, profiles(username, avatar_url), albums(id, title, artist, cover_url)'
    )
    .eq('id', id)
    .maybeSingle()

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="bg-paper border-punk border-black shadow-hard-7-red px-8 py-7 text-center"
          style={{ rotate: '-1deg' }}
        >
          <div className="font-display text-2xl text-ink mb-2">REVIEW NOT FOUND</div>
          <p className="font-punk-mono text-sm text-ink-600 m-0">
            This review may have been deleted.
          </p>
        </div>
      </div>
    )
  }

  const album = normalizeAlbum(review.albums)
  const author = normalizeAuthor(review.profiles)

  let liked = false
  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('profile_id', user.id)
      .eq('target_id', id)
      .eq('target_type', 'review')
      .maybeSingle()
    liked = !!like
  }

  const comments = await listComments(id)

  let whoToFollowData: { id: string; username: string | null; reviewCount: number }[] = []
  if (user) {
    const { data: followRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIdSet = new Set((followRows ?? []).map((f) => f.following_id))

    const { data: suggestions } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', user.id)
      .order('created_at', { ascending: false })
      .limit(8)

    const whoToFollow = (suggestions ?? []).filter((p) => !followingIdSet.has(p.id)).slice(0, 3)
    const reviewCounts = await Promise.all(
      whoToFollow.map((p) => supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('profile_id', p.id)),
    )
    whoToFollowData = whoToFollow.map((profile, i) => ({
      id: profile.id,
      username: profile.username,
      reviewCount: reviewCounts[i]?.count ?? 0,
    }))
  }

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-[1fr_300px]">
      <main className="overflow-hidden">
        <div className="px-6 sm:px-9 py-8 flex flex-col gap-5">
          <div className="flex items-start gap-3 bg-paper border-punk border-black shadow-hard-5-blue p-3.5 text-ink">
            {album && (
              <Link href={`/album/${album.id}`}>
                <AlbumCoverThumb src={album.cover_url} sizePx={56} sizes="56px" />
              </Link>
            )}

            <div className="min-w-0 flex-1">
              {album && (
                <Link href={`/album/${album.id}`} className="block mb-1.5">
                  <div className="font-display text-sm leading-none">{album.title}</div>
                  <div className="text-ink-600 font-punk-mono text-10-5 mt-0.5">{album.artist}</div>
                </Link>
              )}

              <div className="flex items-center gap-2 font-punk-mono text-10-5 text-ink-600 mb-1.5">
                {author?.username ? (
                  <Link href={`/profile/${author.username}`} className="hover:underline">
                    <b className="text-ink">{author.username}</b>
                  </Link>
                ) : (
                  <b className="text-ink">someone</b>
                )}
                <span className="text-ink-500">
                  {new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="mb-1.5">
                <StarRating rating={review.rating} />
              </div>

              {review.content && (
                <p className="m-0 text-xs leading-normal whitespace-pre-wrap text-ink-800">
                  {review.is_spoiler ? '⚠ Spoiler review — visit the album page to reveal.' : review.content}
                </p>
              )}

              <div className="mt-2.5">
                <LikeButton reviewId={id} initialLiked={liked} initialCount={review.like_count} />
              </div>
            </div>
          </div>

          <div
            className="font-display text-lg w-fit"
            style={{ color: 'var(--color-brand-yellow)', textShadow: '2.5px 2.5px 0 var(--color-brand-red)', rotate: '-1deg' }}
          >
            REPLIES
          </div>

          <ReplyThread reviewId={id} initialComments={comments} />
        </div>
      </main>

      <aside className="border-l-punk border-paper px-4 py-5.5 hidden xl:flex flex-col gap-6.5">
        <HomeSearchTrigger />
        <WhoToFollowList suggestions={whoToFollowData} variant="sidebar" />
      </aside>
    </div>
  )
}
