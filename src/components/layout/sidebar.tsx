import Link from 'next/link'
import { Home, Search, Bell, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SidebarNavLink } from './sidebar-nav-link'
import { SidebarAuth } from './sidebar-auth'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/activity', label: 'Activity', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { username: string | null; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r px-4 py-6">
      <div className="flex flex-col gap-6">
        <Link href="/" className="px-2 text-xl font-bold">deepcutz</Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <SidebarNavLink key={href} href={href} label={label} icon={<Icon className="h-6 w-6" />} />
          ))}
        </nav>
      </div>
      <div className="px-2">
        <SidebarAuth user={user} profile={profile} />
      </div>
    </aside>
  )
}
