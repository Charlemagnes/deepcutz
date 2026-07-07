import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAlbumDetails, searchAlbums } from './actions'
import type { AlbumSearchResult } from './types'

vi.mock('./client', () => ({
  searchAlbums: vi.fn(),
  getSpotifyAlbum: vi.fn(),
}))

vi.mock('./normalize', () => ({
  normalizeSpotifyAlbum: vi.fn(),
}))

const result: AlbumSearchResult = {
  id: 'album-1',
  title: 'Kid A',
  artist: 'Radiohead',
  coverUrl: null,
  releaseDate: '2000-10-02',
}

describe('searchAlbums action', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('short-circuits an empty query without calling the client', async () => {
    const { searchAlbums: clientSearchAlbums } = await import('./client')

    const results = await searchAlbums('   ')

    expect(results).toEqual([])
    expect(clientSearchAlbums).not.toHaveBeenCalled()
  })

  it('returns the client results on success', async () => {
    const { searchAlbums: clientSearchAlbums } = await import('./client')
    vi.mocked(clientSearchAlbums).mockResolvedValue([result])

    const results = await searchAlbums('Kid A')

    expect(clientSearchAlbums).toHaveBeenCalledWith('Kid A')
    expect(results).toEqual([result])
  })

  it('swallows a client error into an empty array', async () => {
    const { searchAlbums: clientSearchAlbums } = await import('./client')
    vi.mocked(clientSearchAlbums).mockRejectedValue(new Error('Spotify search failed: 500'))

    const results = await searchAlbums('Kid A')

    expect(results).toEqual([])
  })
})

describe('getAlbumDetails action', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns the normalized album on success', async () => {
    const { getSpotifyAlbum } = await import('./client')
    const { normalizeSpotifyAlbum } = await import('./normalize')
    vi.mocked(getSpotifyAlbum).mockResolvedValue({} as never)
    vi.mocked(normalizeSpotifyAlbum).mockReturnValue(result)

    const details = await getAlbumDetails('album-1')

    expect(details).toEqual(result)
  })

  it('swallows a client error into null', async () => {
    const { getSpotifyAlbum } = await import('./client')
    vi.mocked(getSpotifyAlbum).mockRejectedValue(new Error('Spotify get-album failed: 404'))

    const details = await getAlbumDetails('missing-id')

    expect(details).toBeNull()
  })
})
