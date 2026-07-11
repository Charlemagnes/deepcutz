'use client'

import { toggleLike } from '@/lib/likes/actions'
import { PunkPressButton } from '@/components/marketing/punk-press-button'
import { cn } from '@/lib/utils'
import { useOptimisticToggle } from '@/hooks/use-optimistic-toggle'

export function LikeButton({
  reviewId,
  initialLiked,
  initialCount,
}: {
  reviewId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [{ liked, likeCount: count }, isPending, handleClick] = useOptimisticToggle(
    () => toggleLike(reviewId),
    { liked: initialLiked, likeCount: initialCount },
  )

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
