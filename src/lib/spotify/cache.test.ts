import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { Tables } from '@/lib/database.types'
import { ensureAlbumCached } from './cache'
import { getSpotifyAlbum } from './client'
import type { SpotifyAlbum } from './types'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/supabase/service-role', () => ({
  createServiceRoleClient: vi.fn(),
}))
vi.mock('./client', () => ({
  getSpotifyAlbum: vi.fn(),
}))

const freshAlbum: Tables<'albums'> = {
  id: 'album-1',
  title: 'Kid A',
  artist: 'Radiohead',
  cover_url: 'https://i.scdn.co/image/large',
  release_date: '2000-10-02',
  avg_rating: 4.2,
  rating_count: 10,
  cached_at: new Date().toISOString(),
}

const staleAlbum: Tables<'albums'> = {
  ...freshAlbum,
  cached_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
}

const rawSpotifyAlbum: SpotifyAlbum = {
  id: 'album-1',
  name: 'Kid A',
  album_type: 'album',
  release_date: '2000-10-02',
  release_date_precision: 'day',
  images: [{ url: 'https://i.scdn.co/image/large', height: 640, width: 640 }],
  artists: [{ id: 'artist-1', name: 'Radiohead' }],
}

function mockReadClient(result: { data: Tables<'albums'> | null; error: { message: string } | null }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  return { from }
}

function mockWriteClient(result: { data: Tables<'albums'> | null; error: { message: string } | null }) {
  const single = vi.fn().mockResolvedValue(result)
  const select = vi.fn().mockReturnValue({ single })
  const upsert = vi.fn().mockReturnValue({ select })
  const from = vi.fn().mockReturnValue({ upsert })
  return { from, upsert }
}

describe('ensureAlbumCached', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches and caches an album with no existing row', async () => {
    const readClient = mockReadClient({ data: null, error: null })
    const writeClient = mockWriteClient({ data: freshAlbum, error: null })

    vi.mocked(createClient).mockResolvedValue(readClient as never)
    vi.mocked(createServiceRoleClient).mockReturnValue(writeClient as never)
    vi.mocked(getSpotifyAlbum).mockResolvedValue(rawSpotifyAlbum)

    const result = await ensureAlbumCached('album-1')

    expect(getSpotifyAlbum).toHaveBeenCalledWith('album-1')
    expect(writeClient.upsert).toHaveBeenCalled()
    expect(result).toEqual(freshAlbum)
  })

  it('returns the existing row directly when it is fresh', async () => {
    const readClient = mockReadClient({ data: freshAlbum, error: null })
    vi.mocked(createClient).mockResolvedValue(readClient as never)

    const result = await ensureAlbumCached('album-1')

    expect(result).toEqual(freshAlbum)
    expect(getSpotifyAlbum).not.toHaveBeenCalled()
    expect(createServiceRoleClient).not.toHaveBeenCalled()
  })

  it('refreshes a stale row', async () => {
    const readClient = mockReadClient({ data: staleAlbum, error: null })
    const writeClient = mockWriteClient({ data: freshAlbum, error: null })

    vi.mocked(createClient).mockResolvedValue(readClient as never)
    vi.mocked(createServiceRoleClient).mockReturnValue(writeClient as never)
    vi.mocked(getSpotifyAlbum).mockResolvedValue(rawSpotifyAlbum)

    const result = await ensureAlbumCached('album-1')

    expect(getSpotifyAlbum).toHaveBeenCalledWith('album-1')
    expect(result).toEqual(freshAlbum)
  })

  it('throws when the read fails', async () => {
    const readClient = mockReadClient({ data: null, error: { message: 'db down' } })
    vi.mocked(createClient).mockResolvedValue(readClient as never)

    await expect(ensureAlbumCached('album-1')).rejects.toThrow(/Failed to read cached album/)
  })

  it('degrades to the stale row when the upsert fails', async () => {
    const readClient = mockReadClient({ data: staleAlbum, error: null })
    const writeClient = mockWriteClient({ data: null, error: { message: 'write failed' } })

    vi.mocked(createClient).mockResolvedValue(readClient as never)
    vi.mocked(createServiceRoleClient).mockReturnValue(writeClient as never)
    vi.mocked(getSpotifyAlbum).mockResolvedValue(rawSpotifyAlbum)

    const result = await ensureAlbumCached('album-1')

    expect(result).toEqual(staleAlbum)
  })
})
