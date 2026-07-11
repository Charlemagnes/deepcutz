'use client'

import { toggleFollow } from '@/lib/follows/actions'
import { PunkPressButton } from '@/components/marketing/punk-press-button'
import { cn } from '@/lib/utils'
import { useOptimisticToggle } from '@/hooks/use-optimistic-toggle'

export function FollowButton({
  profileId,
  initialIsFollowing,
}: {
  profileId: string
  initialIsFollowing: boolean
}) {
  const [{ following }, isPending, handleClick] = useOptimisticToggle(
    () => toggleFollow(profileId),
    { following: initialIsFollowing },
  )

  return (
    <PunkPressButton
      onClick={handleClick}
      disabled={isPending}
      accent="blue"
      size={3}
      border={2}
      className={cn(
        'shrink-0 font-display text-10 px-2.75 py-1.5 transition-transform hover:scale-105 disabled:opacity-50',
        following ? 'bg-transparent text-paper border-paper' : 'bg-brand-yellow text-ink border-black'
      )}
    >
      {following ? 'FOLLOWING' : '+ FOLLOW'}
    </PunkPressButton>
  )
}
