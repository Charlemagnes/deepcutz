'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/lib/follows/actions'
import { PunkPressButton } from '@/components/marketing/punk-press-button'
import { cn } from '@/lib/utils'

export function FollowButton({
  profileId,
  initialIsFollowing,
}: {
  profileId: string
  initialIsFollowing: boolean
}) {
  const [following, setFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(profileId)
      setFollowing(result.following)
    })
  }

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
