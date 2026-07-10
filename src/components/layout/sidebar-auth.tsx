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
        <Button className="w-full transition-transform hover:scale-105">Sign in</Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2.5 pt-3.5 border-t-2 border-dashed border-ink-600">
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="h-8 w-8 border-2 border-black object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-brand-blue text-sm font-medium text-white">
          {(profile?.username ?? user.email ?? '?')[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 truncate leading-tight">
        <div className="font-display text-11">YOU</div>
        <div className="truncate text-ink-500 font-punk-mono text-10">
          {profile?.username ? `@${profile.username}` : user.email}
        </div>
      </div>
      <button
        id="sign-out-button"
        type="button"
        onClick={handleSignOut}
        className="p-1.5 text-ink-500 transition-all hover:text-paper hover:scale-110"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  )
}
