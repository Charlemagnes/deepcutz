export type AlbumRef = {
  id: string
  title: string
  artist: string
  cover_url: string | null
}

export type AuthorRef = {
  username: string | null
  avatar_url: string | null
}

/** Reviews/diary_entries come back with `albums(...)`/`profiles(...)` joined; Postgrest can
 *  shape a many-to-one relation as either an object or a single-item array depending on
 *  inference, so normalize defensively. */
export function normalizeAlbum(value: unknown): AlbumRef | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const album = raw as Record<string, unknown>
  if (typeof album.id !== 'string' || typeof album.title !== 'string' || typeof album.artist !== 'string') {
    return null
  }
  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    cover_url: typeof album.cover_url === 'string' ? album.cover_url : null,
  }
}

export function normalizeAuthor(value: unknown): AuthorRef | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'object') return null
  const profile = raw as Record<string, unknown>
  return {
    username: typeof profile.username === 'string' ? profile.username : null,
    avatar_url: typeof profile.avatar_url === 'string' ? profile.avatar_url : null,
  }
}
