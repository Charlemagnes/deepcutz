import { describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'
import { getSpotifyAlbum, searchAlbums } from './client'
import type { SpotifyAlbum, SpotifySearchAlbumsResponse } from './types'

vi.mock('./auth', () => ({
  getAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

const rawAlbum: SpotifyAlbum = {
  id: 'album-1',
  name: 'Kid A',
  album_type: 'album',
  release_date: '2000-10-02',
  release_date_precision: 'day',
  images: [{ url: 'https://i.scdn.co/image/large', height: 640, width: 640 }],
  artists: [{ id: 'artist-1', name: 'Radiohead' }],
}

describe('searchAlbums', () => {
  it('sends a type=album search query and maps the results', async () => {
    let capturedUrl: URL | undefined
    server.use(
      http.get('https://api.spotify.com/v1/search', ({ request }) => {
        capturedUrl = new URL(request.url)
        const body: SpotifySearchAlbumsResponse = {
          albums: { items: [rawAlbum], limit: 20, offset: 0, total: 1, next: null },
        }
        return HttpResponse.json(body)
      }),
    )

    const results = await searchAlbums('Kid A')

    expect(capturedUrl?.searchParams.get('type')).toBe('album')
    expect(capturedUrl?.searchParams.get('q')).toBe('Kid A')
    expect(results).toEqual([
      {
        id: 'album-1',
        title: 'Kid A',
        artist: 'Radiohead',
        coverUrl: 'https://i.scdn.co/image/large',
        releaseDate: '2000-10-02',
      },
    ])
  })

  it('throws on a non-ok response', async () => {
    server.use(
      http.get('https://api.spotify.com/v1/search', () =>
        HttpResponse.json({ error: 'rate limited' }, { status: 429 }),
      ),
    )

    await expect(searchAlbums('Kid A')).rejects.toThrow(/Spotify search failed/)
  })
})

describe('getSpotifyAlbum', () => {
  it('fetches the raw album by id', async () => {
    server.use(
      http.get('https://api.spotify.com/v1/albums/:id', ({ params }) => {
        expect(params.id).toBe('album-1')
        return HttpResponse.json(rawAlbum)
      }),
    )

    const result = await getSpotifyAlbum('album-1')

    expect(result).toEqual(rawAlbum)
  })

  it('throws on a non-ok response', async () => {
    server.use(
      http.get('https://api.spotify.com/v1/albums/:id', () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 }),
      ),
    )

    await expect(getSpotifyAlbum('missing-id')).rejects.toThrow(/Spotify get-album failed/)
  })
})
