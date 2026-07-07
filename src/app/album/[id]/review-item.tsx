'use client'

import { useState } from 'react'
import { StarRating } from '@/components/marketing/star-rating'
import { LikeButton } from '@/components/likes/like-button'
import { CommentSection } from '@/components/comments/comment-section'

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
    <div className="bg-[#f2f2f2] border-[3px] border-black shadow-[5px_5px_0_#2b6bff] p-4 text-[#0a0a0a]">
      <div className="flex items-center gap-2.5 font-[family-name:var(--font-space-mono)] text-[11px] text-[#555] mb-2">
        <span className="w-[16px] h-[16px] rounded-full bg-[#ff2b2b] border border-black shrink-0" />
        <b className="text-[#0a0a0a]">{username}</b>
        <span className="text-[#999]">
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="mb-2">
        <StarRating rating={rating} />
      </div>

      {content && (
        <div className="relative">
          <p
            className={`m-0 text-[13px] leading-[1.5] max-w-[560px] whitespace-pre-wrap ${
              blurred ? 'blur-sm select-none' : ''
            }`}
          >
            {content}
          </p>
          {blurred && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="absolute inset-0 flex items-center justify-center bg-[#f2f2f2]/70 font-[family-name:var(--font-bungee)] text-xs text-[#0a0a0a] border-2 border-black shadow-[3px_3px_0_#ff2b2b] mx-auto my-auto w-fit h-fit px-3 py-2"
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
