import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { getUnreadNotificationCount } from '@/lib/notifications/actions'
import { Wordmark } from '@/components/marketing/wordmark'
import { SidebarNavLink } from './sidebar-nav-link'
import { SidebarLogButton } from './sidebar-log-button'
import { SidebarAuth } from './sidebar-auth'

const NAV_ITEMS = [
  { href: '/', label: 'HOME', accent: 'light', rotate: -1.5 },
  { href: '/explore', label: 'EXPLORE', accent: 'yellow', rotate: 1 },
  { href: '/notifications', label: 'NOTIF', accent: 'red', rotate: -1 },
  { href: '/profile', label: 'PROFILE', accent: 'blue', rotate: 1.5 },
] as const

function NotificationCountBadge({ count }: { count: number }) {
  return (
    <span className="bg-[#ff2b2b] text-white border border-black rounded-full text-[10px] px-1.5 py-0.5 leading-none">
      {count > 9 ? '9+' : count}
    </span>
  )
}

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
    <aside className="sticky top-0 z-20 flex h-screen w-[236px] shrink-0 flex-col gap-[22px] border-r-[3px] border-[#f2f2f2] bg-[#0a0a0a] px-[18px] py-[26px] text-[#f2f2f2]">
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
            badge={href === '/notifications' && unreadCount > 0 ? <NotificationCountBadge count={unreadCount} /> : undefined}
          />
        ))}
      </nav>

      <SidebarLogButton />

      <SidebarAuth user={user} profile={profile} />
    </aside>
  )
}
