import { describe, expect, it } from 'vitest'
import { normalizeSpotifyAlbum, toAlbumInsert } from './normalize'
import type { SpotifyAlbum } from './types'

function makeRawAlbum(overrides: Partial<SpotifyAlbum> = {}): SpotifyAlbum {
  return {
    id: 'album-1',
    name: 'Kid A',
    album_type: 'album',
    release_date: '2000-10-02',
    release_date_precision: 'day',
    images: [
      { url: 'https://i.scdn.co/image/large', height: 640, width: 640 },
      { url: 'https://i.scdn.co/image/small', height: 64, width: 64 },
    ],
    artists: [{ id: 'artist-1', name: 'Radiohead' }],
    ...overrides,
  }
}

describe('normalizeSpotifyAlbum', () => {
  it('keeps a day-precision release date unchanged', () => {
    const result = normalizeSpotifyAlbum(makeRawAlbum())
    expect(result.releaseDate).toBe('2000-10-02')
  })

  it('pads a month-precision release date to the first of the month', () => {
    const result = normalizeSpotifyAlbum(
      makeRawAlbum({ release_date: '1981-12', release_date_precision: 'month' }),
    )
    expect(result.releaseDate).toBe('1981-12-01')
  })

  it('pads a year-precision release date to January 1st', () => {
    const result = normalizeSpotifyAlbum(
      makeRawAlbum({ release_date: '1981', release_date_precision: 'year' }),
    )
    expect(result.releaseDate).toBe('1981-01-01')
  })

  it('joins multiple artist names with a comma', () => {
    const result = normalizeSpotifyAlbum(
      makeRawAlbum({
        artists: [
          { id: 'a1', name: 'Jay-Z' },
          { id: 'a2', name: 'Kanye West' },
        ],
      }),
    )
    expect(result.artist).toBe('Jay-Z, Kanye West')
  })

  it('takes the first (widest) image as the cover', () => {
    const result = normalizeSpotifyAlbum(makeRawAlbum())
    expect(result.coverUrl).toBe('https://i.scdn.co/image/large')
  })

  it('returns a null cover when there are no images', () => {
    const result = normalizeSpotifyAlbum(makeRawAlbum({ images: [] }))
    expect(result.coverUrl).toBeNull()
  })
})

describe('toAlbumInsert', () => {
  it('maps exactly the albums-table insert fields', () => {
    const insert = toAlbumInsert(makeRawAlbum())
    expect(insert).toEqual({
      id: 'album-1',
      title: 'Kid A',
      artist: 'Radiohead',
      cover_url: 'https://i.scdn.co/image/large',
      release_date: '2000-10-02',
    })
  })
})
