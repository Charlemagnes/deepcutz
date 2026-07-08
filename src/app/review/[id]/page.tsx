import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listComments } from '@/lib/comments/actions'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { ReplyThread } from '@/components/comments/reply-thread'

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

  return (
    <div className="min-h-screen px-6 sm:px-9 py-8 max-w-160 mx-auto">
      <div className="flex items-start gap-3 bg-paper border-punk border-black shadow-hard-5-blue p-3.5 text-ink mb-6">
        {album && (
          <Link href={`/album/${album.id}`} className="relative w-14 h-14 border-2 border-black bg-ink-800 shrink-0">
            {album.cover_url && (
              <Image src={album.cover_url} alt="" fill sizes="56px" className="object-cover" />
            )}
          </Link>
        )}

        <div className="min-w-0 flex-1">
          {album && (
            <Link href={`/album/${album.id}`} className="block mb-1.5">
              <div className="font-display text-sm leading-none">{album.title}</div>
              <div className="text-ink-600 font-punk-mono text-[10.5px] mt-0.5">{album.artist}</div>
            </Link>
          )}

          <div className="flex items-center gap-2 font-punk-mono text-[10.5px] text-ink-600 mb-1.5">
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
            <p className="m-0 text-[12px] leading-normal whitespace-pre-wrap text-ink-800">
              {review.is_spoiler ? '⚠ Spoiler review — visit the album page to reveal.' : review.content}
            </p>
          )}

          <div className="mt-2.5">
            <LikeButton reviewId={id} initialLiked={liked} initialCount={review.like_count} />
          </div>
        </div>
      </div>

      <div
        className="font-display text-lg w-fit mb-4"
        style={{ color: 'var(--color-brand-yellow)', textShadow: '2.5px 2.5px 0 var(--color-brand-red)', rotate: '-1deg' }}
      >
        REPLIES
      </div>

      <ReplyThread reviewId={id} initialComments={comments} />
    </div>
  )
}
