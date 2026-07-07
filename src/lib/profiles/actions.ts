'use server'

import { createClient } from '@/lib/supabase/server'

export interface ProfileSearchResult {
  id: string
  username: string | null
  avatar_url: string | null
}

export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
      .limit(20)

    if (error) throw error

    return data ?? []
  } catch (error) {
    console.error('[profiles] searchProfiles action failed:', error)
    return []
  }
}
