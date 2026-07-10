'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFeedReviewById } from '@/lib/reviews/actions'
import { FeedCard, type FeedItem } from './feed-card'

/** Renders the home feed's review list and keeps it live: reviews the viewer posts
 *  themselves are inserted at the top the instant they arrive (they took that
 *  action, they expect to see it — no banner). Reviews from people they follow
 *  accumulate behind a click-to-reveal "N new reviews" banner instead, matching
 *  Twitter's actual behavior (new posts are fetched in the background as soon as
 *  the event arrives, but only inserted into the DOM on click) rather than the
 *  "auto-prepend everything" reading of the original spec text.
 *
 *  Always mounts (even when `initialItems` is empty) so the subscription is live
 *  from the moment a brand-new/empty feed renders — the empty-state/follow-nudge
 *  branching lives here, driven by the live `items` count, rather than in the
 *  server-rendered parent, so a review arriving live can flip the feed out of its
 *  empty state without a page reload. */
export function LiveFeed({
  initialItems,
  likedReviewIds,
  feedProfileIds,
  userId,
  emptyState,
  followNudge,
}: {
  initialItems: FeedItem[]
  likedReviewIds: Set<string>
  feedProfileIds: string[]
  userId: string
  emptyState: ReactNode
  followNudge: ReactNode
}) {
  const [items, setItems] = useState(initialItems)
  const [pendingCount, setPendingCount] = useState(0)
  const pendingItemsRef = useRef<Extract<FeedItem, { kind: 'review' }>[]>([])
  const knownIdsRef = useRef(new Set(initialItems.map((item) => item.id)))

  useEffect(() => {
    if (feedProfileIds.length === 0) return

    const supabase = createClient()
    const channel = supabase
      .channel('home-feed-reviews')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `profile_id=in.(${feedProfileIds.join(',')})`,
        },
        async (payload) => {
          const reviewId = payload.new.id as string
          if (knownIdsRef.current.has(reviewId)) return

          const result = await getFeedReviewById(reviewId)
          if (!result || knownIdsRef.current.has(result.item.id)) return
          knownIdsRef.current.add(result.item.id)

          if (result.profileId === userId) {
            setItems((prev) => [result.item, ...prev])
          } else {
            pendingItemsRef.current = [result.item, ...pendingItemsRef.current]
            setPendingCount(pendingItemsRef.current.length)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [feedProfileIds, userId])

  function revealPending() {
    const pending = pendingItemsRef.current
    pendingItemsRef.current = []
    setItems((prev) => [...pending, ...prev])
    setPendingCount(0)
    window.scrollTo({ top: 0 })
  }

  if (items.length === 0 && pendingCount === 0) return <>{emptyState}</>

  return (
    <>
      {followNudge}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={revealPending}
          className="font-punk-mono text-11 font-bold text-ink bg-brand-yellow border-punk border-black shadow-hard-3-blue px-3.5 py-2 self-start cursor-pointer hover:scale-105 transition-transform"
        >
          ↑ {pendingCount} NEW REVIEW{pendingCount === 1 ? '' : 'S'}
        </button>
      )}
      {items.map((item) => (
        <FeedCard key={`${item.kind}-${item.id}`} item={item} liked={item.kind === 'review' && likedReviewIds.has(item.id)} />
      ))}
    </>
  )
}
