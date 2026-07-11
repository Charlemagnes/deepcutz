import Link from 'next/link'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { HardShadowCard } from '@/components/marketing/hard-shadow-card'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'
import type { AlbumRef } from '@/lib/supabase/normalize'
import { SpoilerReview } from './spoiler-review'
import { EmptyState } from './empty-state'

export type ReviewWithContent = {
  id: string
  rating: number
  content: string
  isSpoiler: boolean
  createdAt: string
  likeCount: number
  commentCount: number
  album: AlbumRef
}

export function ReviewsList({
  reviews,
  likedIds,
  emptyMessage,
}: {
  reviews: ReviewWithContent[]
  likedIds: Set<string>
  emptyMessage: string
}) {
  if (reviews.length === 0) return <EmptyState>{emptyMessage}</EmptyState>

  return (
    <div className="flex flex-col gap-3.5">
      {reviews.map((review) => (
        <HardShadowCard key={review.id} accent="cyan" border={2} shadow={5} className="p-4">
          <Link href={`/album/${review.album.id}`} className="flex items-center gap-3 mb-2.5">
            <AlbumCoverThumb src={review.album.cover_url} sizePx={42} sizes="42px" />
            <div className="min-w-0">
              <div className="font-display text-sm leading-tight truncate">{review.album.title}</div>
              <div className="text-ink-600 font-punk-mono text-10-5 truncate">{review.album.artist}</div>
            </div>
          </Link>
          <div className="mb-2">
            <StarRating rating={review.rating} />
          </div>
          {review.isSpoiler ? (
            <SpoilerReview content={review.content} />
          ) : (
            <p className="m-0 text-12-5 leading-normal text-ink-800 whitespace-pre-wrap">{review.content}</p>
          )}
          <div className="flex items-center gap-3 mt-2.5">
            <LikeButton reviewId={review.id} initialLiked={likedIds.has(review.id)} initialCount={review.likeCount} />
            <Link href={`/review/${review.id}`} className="text-11 text-ink-500 font-punk-mono">
              💬 {review.commentCount}
            </Link>
          </div>
        </HardShadowCard>
      ))}
    </div>
  )
}
