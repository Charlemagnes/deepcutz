import Link from 'next/link'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { SpoilerReview } from '@/app/profile/[username]/spoiler-review'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'
import { AttributionLine } from '@/components/marketing/attribution-line'
import type { Accent } from '@/components/marketing/types'
import type { AlbumRef, AuthorRef } from '@/lib/supabase/normalize'
import { formatDate } from '@/lib/format'

const CARD_ACCENTS: Accent[] = ['red', 'blue', 'yellow', 'cyan']
function accentForId(id: string): Accent {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return CARD_ACCENTS[Math.abs(hash) % CARD_ACCENTS.length]
}

export const REVIEW_FEED_SELECT =
  'id, rating, content, is_spoiler, created_at, like_count, comment_count, profile_id, profiles(username, avatar_url), albums(id, title, artist, cover_url)'

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

export function FeedCard({ item, liked }: { item: FeedItem; liked: boolean }) {
  const accent = accentForId(item.id)
  return (
    <div className="grid grid-cols-[126px_1fr] gap-4.5 bg-paper border-punk border-black shadow-hard-6-blue p-3.5 text-ink">
      <Link href={`/album/${item.album.id}`}>
        <AlbumCoverThumb src={item.album.cover_url} sizePx={126} sizes="126px" />
      </Link>
      <div className="min-w-0">
        <AttributionLine
          username={item.author.username}
          href={item.author.username ? `/profile/${item.author.username}` : undefined}
          timestampLabel={`${item.kind === 'review' ? 'RATED' : 'LOGGED'} · ${formatDate(item.createdAt)}`}
          accent={accent}
        />
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
