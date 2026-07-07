import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { Tables } from '@/lib/database.types'
import { getSpotifyAlbum } from './client'
import { toAlbumInsert } from './normalize'

/** Cache-on-write: albums are only persisted when a user logs/reviews them, refreshed if stale. */
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Returns the cached `albums` row for a Spotify album id, fetching and upserting it
 * (via the service-role client, since RLS grants no write access to `albums`) if it's
 * missing or older than the staleness window. Has no caller yet — Phase 3's
 * review/diary-submission flow will call this before writing to `reviews`/`diary_entries`.
 */
export async function ensureAlbumCached(spotifyAlbumId: string): Promise<Tables<'albums'>> {
  const supabase = await createClient()
  const { data: existing, error } = await supabase
    .from('albums')
    .select('*')
    .eq('id', spotifyAlbumId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to read cached album ${spotifyAlbumId}: ${error.message}`)
  }

  if (existing && !isStale(existing.cached_at)) {
    return existing
  }

  const raw = await getSpotifyAlbum(spotifyAlbumId)
  const insert = toAlbumInsert(raw)

  const serviceClient = createServiceRoleClient()
  const { data: upserted, error: upsertError } = await serviceClient
    .from('albums')
    .upsert({ ...insert, cached_at: new Date().toISOString() }, { onConflict: 'id' })
    .select('*')
    .single()

  if (upsertError || !upserted) {
    if (existing) return existing
    throw new Error(`Failed to cache album ${spotifyAlbumId}: ${upsertError?.message}`)
  }

  return upserted
}

function isStale(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() > STALE_AFTER_MS
}
