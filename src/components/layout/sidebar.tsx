import Link from 'next/link'
import { Home, Search, Bell, User } from 'lucide-react'
import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { SidebarNavLink } from './sidebar-nav-link'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/activity', label: 'Activity', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
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
        <Show
          when="signed-in"
          fallback={
            <SignInButton mode="modal"><Button className="w-full">Sign in</Button></SignInButton>
          }
        >
          <UserButton showName />
        </Show>
      </div>
    </aside>
  )
}
