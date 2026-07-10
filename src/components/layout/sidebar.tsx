import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { getUnreadNotificationCount } from '@/lib/notifications/actions'
import { Wordmark } from '@/components/marketing/wordmark'
import { SidebarNavLink } from './sidebar-nav-link'
import { SidebarLogButton } from './sidebar-log-button'
import { SidebarAuth } from './sidebar-auth'
import { NotificationBadge } from './notification-badge'

const NAV_ITEMS = [
  { href: '/', label: 'HOME', accent: 'light', rotate: -1.5 },
  { href: '/explore', label: 'EXPLORE', accent: 'yellow', rotate: 1 },
  { href: '/notifications', label: 'NOTIF', accent: 'red', rotate: -1 },
  { href: '/profile', label: 'PROFILE', accent: 'blue', rotate: 1.5 },
] as const

export async function Sidebar() {
  const user = await getCurrentUser()

  let profile: { username: string | null; avatar_url: string | null } | null = null
  let unreadCount = 0
  if (user) {
    const supabase = await createClient()
    const [{ data }, count] = await Promise.all([
      supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single(),
      getUnreadNotificationCount(),
    ])
    profile = data
    unreadCount = count
  }

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-59 shrink-0 flex-col gap-5.5 border-r-punk border-paper bg-ink px-4.5 py-6.5 text-paper">
      <Link href="/" className="w-fit">
        <Wordmark />
      </Link>

      <nav className="flex flex-col gap-2.5">
        {NAV_ITEMS.map(({ href, label, accent, rotate }) => (
          <SidebarNavLink
            key={href}
            href={href}
            label={label}
            accent={accent}
            rotate={rotate}
            badge={
              href === '/notifications' && user ? (
                <NotificationBadge initialCount={unreadCount} userId={user.id} />
              ) : undefined
            }
          />
        ))}
      </nav>

      <SidebarLogButton />

      <SidebarAuth user={user} profile={profile} />
    </aside>
  )
}
