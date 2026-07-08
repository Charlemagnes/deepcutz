'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUnreadNotificationCount } from '@/lib/notifications/actions'

/** Live-updating version of the notifications sidebar badge. `Sidebar` stays an
 *  `async` Server Component computing the initial count as before; this client
 *  component only owns bumping that count as new notifications arrive in real
 *  time, and reconciling it with a fresh server count after a reconnect (a missed
 *  event during a disconnect would otherwise under-count until the next full page
 *  load). */
export function NotificationBadge({ initialCount, userId }: { initialCount: number; userId: string }) {
  const [count, setCount] = useState(initialCount)
  const pathname = usePathname()

  // Reset the badge the moment the route becomes `/notifications`, in sync with
  // `markAllNotificationsRead()` firing server-side on that page. Adjusted during
  // render (React's recommended pattern for state that must react to a prop/route
  // change) rather than in an effect, since an effect would render the stale count
  // first and only clear it a tick later.
  const [syncedPathname, setSyncedPathname] = useState(pathname)
  if (pathname !== syncedPathname) {
    setSyncedPathname(pathname)
    if (pathname === '/notifications') {
      setCount(0)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    let hasDisconnected = false

    const channel = supabase
      .channel('sidebar-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          setCount((prev) => prev + 1)
        },
      )
      .subscribe((status) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          hasDisconnected = true
        } else if (status === 'SUBSCRIBED' && hasDisconnected) {
          hasDisconnected = false
          getUnreadNotificationCount().then(setCount)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (count === 0) return null

  return (
    <span className="bg-brand-red text-white border border-black rounded-full text-[10px] px-1.5 py-0.5 leading-none">
      {count > 9 ? '9+' : count}
    </span>
  )
}
