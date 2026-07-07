'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'

export async function toggleLike(reviewId: string): Promise<{ liked: boolean; likeCount: number }> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: existing, error: selectError } = await supabase
    .from('likes')
    .select('id')
    .eq('profile_id', user.id)
    .eq('target_id', reviewId)
    .eq('target_type', 'review')
    .maybeSingle()

  if (selectError) {
    throw new Error(`Failed to read like state: ${selectError.message}`)
  }

  let liked: boolean

  if (existing) {
    const { error: deleteError } = await supabase.from('likes').delete().eq('id', existing.id)
    if (deleteError) throw new Error(`Failed to unlike: ${deleteError.message}`)
    liked = false
  } else {
    const { error: insertError } = await supabase
      .from('likes')
      .insert({ profile_id: user.id, target_id: reviewId, target_type: 'review', review_id: reviewId })

    if (insertError) {
      throw new Error(`Failed to like: ${insertError.message}`)
    }
    liked = true
  }

  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('like_count')
    .eq('id', reviewId)
    .single()

  if (reviewError) {
    throw new Error(`Failed to read like count: ${reviewError.message}`)
  }

  return { liked, likeCount: review.like_count }
}
