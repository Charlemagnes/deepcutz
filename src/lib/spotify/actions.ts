'use server'

import { getSpotifyAlbum, searchAlbums as searchAlbumsClient } from './client'
import { normalizeSpotifyAlbum } from './normalize'
import type { AlbumSearchResult } from './types'

export async function searchAlbums(query: string): Promise<AlbumSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  try {
    return await searchAlbumsClient(trimmed)
  } catch (error) {
    console.error('[spotify] searchAlbums action failed:', error)
    return []
  }
}

export async function getAlbumDetails(spotifyId: string): Promise<AlbumSearchResult | null> {
  try {
    return normalizeSpotifyAlbum(await getSpotifyAlbum(spotifyId))
  } catch (error) {
    console.error('[spotify] getAlbumDetails action failed:', error)
    return null
  }
}
