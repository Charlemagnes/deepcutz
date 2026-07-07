import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
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

export async function Sidebar() {
  const user = await getCurrentUser()

  let profile: { username: string | null; avatar_url: string | null } | null = null
  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[236px] shrink-0 flex-col gap-[22px] border-r-[3px] border-[#f2f2f2] bg-[#0a0a0a] px-[18px] py-[26px] text-[#f2f2f2]">
      <Link href="/" className="w-fit">
        <Wordmark />
      </Link>

      <nav className="flex flex-col gap-2.5">
        {NAV_ITEMS.map(({ href, label, accent, rotate }) => (
          <SidebarNavLink key={href} href={href} label={label} accent={accent} rotate={rotate} />
        ))}
      </nav>

      <SidebarLogButton />

      <SidebarAuth user={user} profile={profile} />
    </aside>
  )
}
