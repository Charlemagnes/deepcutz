import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createClient } from '@/lib/supabase/server'

/**
 * `/profile` has no meaningful content of its own — it's a permalink to
 * "whoever is signed in right now". Resolve the session to a username and
 * bounce to the real profile route.
 */
export default async function ProfileRedirectPage() {
  const user = await getCurrentUser()

  // Middleware already gates this route to authenticated users, but stay
  // defensive rather than assuming that always holds.
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.username) {
    // Mid-onboarding edge case — shouldn't normally be reachable since
    // middleware sends usernameless users to /onboarding first.
    redirect('/onboarding')
  }

  redirect(`/profile/${profile.username}`)
}
