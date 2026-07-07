import type { TablesInsert } from '@/lib/database.types'
import type { AlbumSearchResult, SpotifyAlbum } from './types'

export function normalizeSpotifyAlbum(raw: SpotifyAlbum): AlbumSearchResult {
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists.map((artist) => artist.name).join(', '),
    coverUrl: raw.images[0]?.url ?? null,
    releaseDate: padReleaseDate(raw.release_date, raw.release_date_precision),
  }
}

/** Spotify's `release_date` is truncated per `release_date_precision`; the `albums.release_date` column is a Postgres `date`, so partial dates must be padded to a full YYYY-MM-DD. */
function padReleaseDate(releaseDate: string, precision: SpotifyAlbum['release_date_precision']): string {
  if (precision === 'day') return releaseDate
  if (precision === 'month') return `${releaseDate}-01`
  return `${releaseDate}-01-01`
}

export function toAlbumInsert(raw: SpotifyAlbum): TablesInsert<'albums'> {
  const normalized = normalizeSpotifyAlbum(raw)
  return {
    id: normalized.id,
    title: normalized.title,
    artist: normalized.artist,
    cover_url: normalized.coverUrl,
    release_date: normalized.releaseDate,
  }
}
