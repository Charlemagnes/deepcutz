export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  album_type: string
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  images: SpotifyImage[]
  artists: SpotifyArtist[]
}

export interface SpotifySearchAlbumsResponse {
  albums: {
    items: SpotifyAlbum[]
    limit: number
    offset: number
    total: number
    next: string | null
  }
}

/** UI-facing shape returned by search/details — not the DB row shape. */
export interface AlbumSearchResult {
  id: string
  title: string
  artist: string
  coverUrl: string | null
  releaseDate: string | null
}

export interface SpotifyTrack {
  track_number: number
  name: string
  duration_ms: number
}

export interface SpotifyAlbumTracksResponse {
  items: SpotifyTrack[]
  limit: number
  offset: number
  total: number
  next: string | null
}

/** UI-facing shape for a single track, returned by getAlbumTracks. */
export interface AlbumTrack {
  trackNumber: number
  title: string
  durationMs: number
}
