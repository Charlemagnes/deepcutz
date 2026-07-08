'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeAlbum, normalizeAuthor, REVIEW_FEED_SELECT, type FeedItem } from '@/components/home/feed-card'

/** Fetches one review, joined with its album/author, in the same shape the home
 *  feed's initial server-rendered query uses. Called client-side (from the live
 *  feed's realtime subscription) once per new-review event, since a
 *  `postgres_changes` INSERT payload only carries raw `reviews` columns — not the
 *  joined album/profile data `FeedCard` needs to render. Returns `null` if the row
 *  is gone by the time we look (e.g. deleted between event and fetch) or excluded
 *  by RLS. */
export async function getFeedReviewById(
  reviewId: string,
): Promise<{ item: Extract<FeedItem, { kind: 'review' }>; profileId: string } | null> {
  const supabase = await createClient()

  const { data: review, error } = await supabase
    .from('reviews')
    .select(REVIEW_FEED_SELECT)
    .eq('id', reviewId)
    .single()

  if (error) {
    console.error(`getFeedReviewById(${reviewId}) failed:`, error.message)
    return null
  }
  if (!review) return null

  const album = normalizeAlbum(review.albums)
  const author = normalizeAuthor(review.profiles)
  if (!album || !author) return null

  return {
    profileId: review.profile_id,
    item: {
      kind: 'review',
      id: review.id,
      createdAt: review.created_at,
      rating: review.rating,
      content: review.content,
      isSpoiler: review.is_spoiler,
      likeCount: review.like_count,
      commentCount: review.comment_count,
      album,
      author,
    },
  }
}
