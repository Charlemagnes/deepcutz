'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'

export interface CommentWithAuthor {
  id: string
  content: string
  createdAt: string
  profileId: string
  username: string | null
  avatarUrl: string | null
}

const COMMENT_SELECT = 'id, content, created_at, profile_id, profiles(username, avatar_url)'

/** profiles is a to-one embed but Postgrest can shape it as either an object or a
 *  single-item array depending on inference, so normalize defensively (same pattern
 *  as normalizeAlbum in profile/[username]/page.tsx). */
function normalizeProfile(value: unknown): { username: string | null; avatar_url: string | null } {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return { username: null, avatar_url: null }
  const profile = raw as Record<string, unknown>
  return {
    username: typeof profile.username === 'string' ? profile.username : null,
    avatar_url: typeof profile.avatar_url === 'string' ? profile.avatar_url : null,
  }
}

function toCommentWithAuthor(row: {
  id: string
  content: string
  created_at: string
  profile_id: string
  profiles: unknown
}): CommentWithAuthor {
  const profile = normalizeProfile(row.profiles)
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    profileId: row.profile_id,
    username: profile.username,
    avatarUrl: profile.avatar_url,
  }
}

export async function listComments(reviewId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    throw new Error(`Failed to load comments: ${error.message}`)
  }

  return (data ?? []).map(toCommentWithAuthor)
}

export async function addComment(reviewId: string, content: string): Promise<CommentWithAuthor> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Comment cannot be empty')
  if (trimmed.length > 1000) throw new Error('Comment is too long')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .insert({ profile_id: user.id, review_id: reviewId, content: trimmed })
    .select(COMMENT_SELECT)
    .single()

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`)
  }

  return toCommentWithAuthor(data)
}

export async function deleteComment(commentId: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('profile_id', user.id)

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }
}
