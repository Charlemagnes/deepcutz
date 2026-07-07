'use client'

import { useState } from 'react'
import { StarRating } from '@/components/marketing/star-rating'

export function ReviewItem({
  username,
  rating,
  content,
  isSpoiler,
  createdAt,
}: {
  username: string
  rating: number
  content: string | null
  isSpoiler: boolean
  createdAt: string
}) {
  const [revealed, setRevealed] = useState(false)
  const blurred = isSpoiler && !revealed

  return (
    <div className="bg-paper border-punk border-black shadow-hard-5-blue p-4 text-ink">
      <div className="flex items-center gap-2.5 font-punk-mono text-[11px] text-ink-600 mb-2">
        <span className="w-4 h-4 rounded-full bg-brand-red border border-black shrink-0" />
        <b className="text-ink">{username}</b>
        <span className="text-ink-500">
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
            className={`m-0 text-[13px] leading-[1.5] max-w-140 whitespace-pre-wrap ${
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
    </div>
  )
}
