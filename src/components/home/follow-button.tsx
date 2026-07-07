'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/lib/follows/actions'

export function FollowButton({ profileId }: { profileId: string }) {
  const [following, setFollowing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(profileId)
      setFollowing(result.following)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0 font-display text-[10px] px-[11px] py-1.5 border-2 border-black disabled:opacity-50"
      style={
        following
          ? { background: 'transparent', color: 'var(--color-paper)', borderColor: 'var(--color-paper)' }
          : { background: 'var(--color-brand-yellow)', color: 'var(--color-ink)' }
      }
    >
      {following ? 'FOLLOWING' : '+ FOLLOW'}
    </button>
  )
}
