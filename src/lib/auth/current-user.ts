import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/** Request-deduped session lookup — safe to call from both the root layout and nested Server Components in the same render. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
