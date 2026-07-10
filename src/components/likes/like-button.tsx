'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/lib/likes/actions'
import { PunkPressButton } from '@/components/marketing/punk-press-button'
import { cn } from '@/lib/utils'

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
    <PunkPressButton
      onClick={handleClick}
      disabled={isPending}
      accent="red"
      size={3}
      border={2}
      className={cn(
        'font-punk-mono text-11 flex items-center gap-1 border-black bg-paper px-2 py-1 cursor-pointer transition-transform disabled:cursor-default disabled:opacity-50',
        liked ? 'text-brand-red' : 'text-ink-500'
      )}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </PunkPressButton>
  )
}
