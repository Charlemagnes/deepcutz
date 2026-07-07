'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { ensureAlbumCached } from '@/lib/spotify/cache'

export interface TrackRatingInput {
  trackNumber: number
  rating: number | null
  notes: string
}

export interface SubmitLogInput {
  albumId: string
  rating: number
  review: string
  trackRatings: TrackRatingInput[]
}

/**
 * Always writes both the canonical `reviews` row (upserted per profile/album) and a
 * `diary_entries` row for this listen, plus any rated/annotated tracks — the logging
 * dialog has no separate "just log" mode, every save is a log + review together.
 */
export async function submitLog(input: SubmitLogInput): Promise<{ reviewId: string }> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  await ensureAlbumCached(input.albumId)

  const supabase = await createClient()

  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .upsert(
      {
        profile_id: user.id,
        album_id: input.albumId,
        rating: input.rating,
        content: input.review.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,album_id' },
    )
    .select('id')
    .single()

  if (reviewError || !review) {
    throw new Error(`Failed to save review: ${reviewError?.message}`)
  }

  const { error: diaryError } = await supabase.from('diary_entries').insert({
    profile_id: user.id,
    album_id: input.albumId,
    rating: input.rating,
  })

  if (diaryError) {
    throw new Error(`Failed to log listen: ${diaryError.message}`)
  }

  const ratedTracks = input.trackRatings.filter((t) => t.rating !== null || t.notes.trim())
  if (ratedTracks.length > 0) {
    const { error: trackError } = await supabase.from('track_ratings').upsert(
      ratedTracks.map((t) => ({
        review_id: review.id,
        track_number: t.trackNumber,
        rating: t.rating,
        notes: t.notes.trim() || null,
      })),
      { onConflict: 'review_id,track_number' },
    )

    if (trackError) {
      throw new Error(`Failed to save track ratings: ${trackError.message}`)
    }
  }

  return { reviewId: review.id }
}
