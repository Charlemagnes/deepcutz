'use client'

import { useState } from 'react'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { CommentSection } from '@/components/comments/comment-section'
import { AttributionLine } from '@/components/marketing/attribution-line'
import { formatDate } from '@/lib/format'

export function ReviewItem({
  reviewId,
  username,
  rating,
  content,
  isSpoiler,
  createdAt,
  likeCount,
  commentCount,
  initialLiked,
}: {
  reviewId: string
  username: string
  rating: number
  content: string | null
  isSpoiler: boolean
  createdAt: string
  likeCount: number
  commentCount: number
  initialLiked: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const blurred = isSpoiler && !revealed

  return (
    <div className="bg-paper border-punk border-black shadow-hard-5-blue p-4 text-ink">
      <AttributionLine
        username={username}
        href={`/profile/${username}`}
        timestampLabel={formatDate(createdAt)}
        accent="red"
        className="mb-2"
      />

      <div className="mb-2">
        <StarRating rating={rating} />
      </div>

      {content && (
        <div className="relative">
          <p
            className={`m-0 text-13 leading-normal max-w-140 whitespace-pre-wrap ${
              blurred ? 'blur-sm select-none' : ''
            }`}
          >
            {content}
          </p>
          {blurred && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="absolute inset-0 flex items-center justify-center bg-paper/70 font-display text-xs text-ink border-2 border-black shadow-hard-3-red mx-auto my-auto w-fit h-fit px-3 py-2"
            >
              ⚠ SPOILER — SHOW ANYWAY
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <LikeButton reviewId={reviewId} initialLiked={initialLiked} initialCount={likeCount} />
        <CommentSection reviewId={reviewId} initialCount={commentCount} />
      </div>
    </div>
  )
}
