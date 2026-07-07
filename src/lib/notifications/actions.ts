'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'

export interface NotificationItem {
  id: string
  type: 'follow' | 'like' | 'comment'
  createdAt: string
  isUnread: boolean
  actor: { id: string; username: string | null; avatarUrl: string | null }
  review: { id: string; albumId: string; albumTitle: string; albumArtist: string } | null
}

type NotificationType = NotificationItem['type']

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'follow' || value === 'like' || value === 'comment'
}

/** `actor` comes back from a disambiguated `profiles!notifications_actor_id_fkey`
 *  embed, which Postgrest can shape as either an object or a single-item array
 *  depending on inference — normalize defensively (same pattern as profile page). */
function normalizeActor(value: unknown): NotificationItem['actor'] | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const actor = raw as Record<string, unknown>
  if (typeof actor.id !== 'string') return null
  return {
    id: actor.id,
    username: typeof actor.username === 'string' ? actor.username : null,
    avatarUrl: typeof actor.avatar_url === 'string' ? actor.avatar_url : null,
  }
}

function normalizeAlbum(value: unknown): { title: string; artist: string } | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const album = raw as Record<string, unknown>
  if (typeof album.title !== 'string' || typeof album.artist !== 'string') return null
  return { title: album.title, artist: album.artist }
}

function normalizeReview(value: unknown): NotificationItem['review'] {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const review = raw as Record<string, unknown>
  if (typeof review.id !== 'string' || typeof review.album_id !== 'string') return null
  const album = normalizeAlbum(review.albums)
  if (!album) return null
  return {
    id: review.id,
    albumId: review.album_id,
    albumTitle: album.title,
    albumArtist: album.artist,
  }
}

/** Reads the current user's notification feed. `isUnread` reflects `read_at`
 *  at the time of this read — it's the source of truth for what to visually
 *  mark as unread in this render, so don't call `markAllNotificationsRead`
 *  from within here; that's a separate explicit step callers trigger after
 *  capturing this list. */
export async function listNotifications(): Promise<NotificationItem[]> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select(
      'id, type, created_at, read_at, actor:profiles!notifications_actor_id_fkey(id, username, avatar_url), review:reviews(id, album_id, albums(title, artist))'
    )
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`)
  }

  return (data ?? []).flatMap((row) => {
    if (!isNotificationType(row.type)) return []
    const actor = normalizeActor(row.actor)
    if (!actor) return []
    return [
      {
        id: row.id,
        type: row.type,
        createdAt: row.created_at,
        isUnread: row.read_at === null,
        actor,
        review: normalizeReview(row.review),
      },
    ]
  })
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .is('read_at', null)

  if (error) {
    throw new Error(`Failed to mark notifications read: ${error.message}`)
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  const supabase = await createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .is('read_at', null)

  if (error) {
    throw new Error(`Failed to count notifications: ${error.message}`)
  }

  return count ?? 0
}
