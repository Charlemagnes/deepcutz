'use client'

import { useState, useTransition } from 'react'

/** Runs `action` in a transition and swaps `state` for whatever it resolves to —
 *  the shared shape behind LikeButton/FollowButton's optimistic toggle UI. */
export function useOptimisticToggle<T>(action: () => Promise<T>, initial: T): [T, boolean, () => void] {
  const [state, setState] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      setState(await action())
    })
  }

  return [state, isPending, toggle]
}
