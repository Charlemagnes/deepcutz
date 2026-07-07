import { getAccessToken } from './auth'
import { normalizeSpotifyAlbum } from './normalize'
import type {
  AlbumSearchResult,
  SpotifyAlbum,
  SpotifyAlbumTracksResponse,
  SpotifySearchAlbumsResponse,
} from './types'

const SEARCH_URL = 'https://api.spotify.com/v1/search'
const ALBUMS_URL = 'https://api.spotify.com/v1/albums'

/** Spotify's max page size for the album-tracks endpoint; covers virtually every album in one request. */
const MAX_TRACKS_LIMIT = 50

/** Spotify's Feb 2026 Development Mode changes reject `limit` above 10 (its docs still claim a max of 50 — verified empirically). */
const MAX_SEARCH_LIMIT = 10

export async function searchAlbums(query: string, limit = MAX_SEARCH_LIMIT): Promise<AlbumSearchResult[]> {
  const token = await getAccessToken()
  const url = new URL(SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'album')
  url.searchParams.set('limit', String(Math.min(limit, MAX_SEARCH_LIMIT)))

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new Error(`Spotify search failed: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as SpotifySearchAlbumsResponse
  return data.albums.items.map(normalizeSpotifyAlbum)
}

/** Returns the raw Spotify album (not normalized) so callers that need the DB insert shape can normalize it themselves. */
export async function getSpotifyAlbum(spotifyId: string): Promise<SpotifyAlbum> {
  const token = await getAccessToken()
  const res = await fetch(`${ALBUMS_URL}/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`Spotify get-album failed: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as SpotifyAlbum
}

export async function getSpotifyAlbumTracks(spotifyId: string): Promise<SpotifyAlbumTracksResponse> {
  const token = await getAccessToken()
  const url = new URL(`${ALBUMS_URL}/${spotifyId}/tracks`)
  url.searchParams.set('limit', String(MAX_TRACKS_LIMIT))

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new Error(`Spotify get-album-tracks failed: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as SpotifyAlbumTracksResponse
}
