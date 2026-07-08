'use client'

import { useEffect, useState } from 'react'
import { searchAlbums } from '@/lib/spotify/actions'
import type { AlbumSearchResult } from '@/lib/spotify/types'
import { searchProfiles, type ProfileSearchResult } from '@/lib/profiles/actions'

export type SearchMode = 'albums' | 'people'

export function isSearchMode(value: string | undefined): value is SearchMode {
  return value === 'albums' || value === 'people'
}

export function useSearch(initial: { mode?: SearchMode; query?: string } = {}) {
  const [mode, setMode] = useState<SearchMode>(initial.mode ?? 'albums')
  const [query, setQuery] = useState(initial.query ?? '')
  const [albumResults, setAlbumResults] = useState<AlbumSearchResult[]>([])
  const [peopleResults, setPeopleResults] = useState<ProfileSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      return
    }

    let cancelled = false

    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true)
    })

    const timeout = setTimeout(() => {
      const run = async () => {
        try {
          if (mode === 'albums') {
            const results = await searchAlbums(trimmed)
            if (!cancelled) setAlbumResults(results)
          } else {
            const results = await searchProfiles(trimmed)
            if (!cancelled) setPeopleResults(results)
          }
        } finally {
          if (!cancelled) {
            setHasSearched(true)
            setLoading(false)
          }
        }
      }
      run()
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, mode])

  const trimmedQuery = query.trim()
  const showEmptyPrompt = !trimmedQuery
  const showNoResults =
    !showEmptyPrompt &&
    hasSearched &&
    !loading &&
    (mode === 'albums' ? albumResults.length === 0 : peopleResults.length === 0)

  return {
    mode,
    setMode,
    query,
    setQuery,
    albumResults,
    peopleResults,
    loading,
    trimmedQuery,
    showEmptyPrompt,
    showNoResults,
  }
}
