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
      className="font-[family-name:var(--font-space-mono)] text-[11px] flex items-center gap-1 disabled:opacity-50"
      style={{ color: liked ? '#ff2b2b' : '#888' }}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  )
}
