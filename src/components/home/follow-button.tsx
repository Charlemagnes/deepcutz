'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/lib/follows/actions'

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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0 font-[family-name:var(--font-bungee)] text-[10px] px-[11px] py-1.5 border-2 border-black disabled:opacity-50"
      style={
        following
          ? { background: 'transparent', color: '#f2f2f2', borderColor: '#f2f2f2' }
          : { background: '#ffe000', color: '#0a0a0a' }
      }
    >
      {following ? 'FOLLOWING' : '+ FOLLOW'}
    </button>
  )
}
