import Link from 'next/link'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { SpoilerReview } from '@/app/profile/[username]/spoiler-review'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'

/** Shared `reviews` select shape (joined with album/author) used both by the home
 *  feed's initial server-rendered query and by `getFeedReviewById`'s per-event
 *  realtime top-up fetch, so the two stay in sync as columns are added/renamed. */
export const REVIEW_FEED_SELECT =
  'id, rating, content, is_spoiler, created_at, like_count, comment_count, profile_id, profiles(username, avatar_url), albums(id, title, artist, cover_url)'

export type AlbumRef = {
  id: string
  title: string
  artist: string
  cover_url: string | null
}

export type AuthorRef = {
  username: string | null
  avatar_url: string | null
}

export type FeedItem =
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
export function normalizeAlbum(value: unknown): AlbumRef | null {
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

export function normalizeAuthor(value: unknown): AuthorRef | null {
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

export function FeedCard({ item, liked }: { item: FeedItem; liked: boolean }) {
  return (
    <div className="grid grid-cols-[126px_1fr] gap-4.5 bg-paper border-punk border-black shadow-hard-6-blue p-3.5 text-ink">
      <Link href={`/album/${item.album.id}`}>
        <AlbumCoverThumb src={item.album.cover_url} sizePx={126} sizes="126px" />
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-punk-mono text-11 text-ink-600 mb-1.5">
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
          <div className="text-ink-600 font-punk-mono text-11 my-1">{item.album.artist}</div>
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
            <p className="m-0 text-12-5 leading-normal text-ink-800 max-w-105 line-clamp-2">{item.content}</p>
          )
        )}
        {item.kind === 'review' && (
          <div className="flex items-center gap-4 mt-2.5">
            <LikeButton reviewId={item.id} initialLiked={liked} initialCount={item.likeCount} />
            <Link
              href={`/album/${item.album.id}#review-${item.id}`}
              className="font-punk-mono text-11 text-ink-500 flex items-center gap-1 cursor-pointer"
            >
              💬 {item.commentCount}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
