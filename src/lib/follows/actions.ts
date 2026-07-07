'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'

export async function toggleFollow(targetProfileId: string): Promise<{ following: boolean }> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')
  if (user.id === targetProfileId) throw new Error('Cannot follow yourself')

  const supabase = await createClient()

  const { data: existing, error: selectError } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetProfileId)
    .maybeSingle()

  if (selectError) {
    throw new Error(`Failed to read follow state: ${selectError.message}`)
  }

  if (existing) {
    const { error: deleteError } = await supabase.from('follows').delete().eq('id', existing.id)
    if (deleteError) throw new Error(`Failed to unfollow: ${deleteError.message}`)
    return { following: false }
  }

  const { error: insertError } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetProfileId })

  if (insertError) {
    throw new Error(`Failed to follow: ${insertError.message}`)
  }

  return { following: true }
}
