'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SidebarAuth({
  user,
  profile,
}: {
  user: User | null
  profile: { username: string | null; avatar_url: string | null } | null
}) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login" className="w-full">
        <Button className="w-full">Sign in</Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 truncate">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
          </div>
        )}
        <span className="truncate text-sm font-medium">
          {profile?.username ?? user.email}
        </span>
      </div>
      <button
        id="sign-out-button"
        type="button"
        onClick={handleSignOut}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
