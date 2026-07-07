'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/lib/likes/actions'

export function LikeButton({
  reviewId,
  initialLiked,
  initialCount,
}: {
  reviewId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleLike(reviewId)
      setLiked(result.liked)
      setCount(result.likeCount)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="font-punk-mono text-[11px] flex items-center gap-1 border-2 border-black bg-paper px-2 py-1 shadow-hard-3-red transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
      style={{ color: liked ? 'var(--color-brand-red)' : 'var(--color-ink-500)' }}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  )
}
