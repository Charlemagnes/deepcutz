'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { searchAlbums } from '@/lib/spotify/actions'
import type { AlbumSearchResult } from '@/lib/spotify/types'
import { searchProfiles, type ProfileSearchResult } from '@/lib/profiles/actions'
import { cn } from '@/lib/utils'

type Mode = 'albums' | 'people'

function isMode(value: string | undefined): value is Mode {
  return value === 'albums' || value === 'people'
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  const initialParams = use(searchParams)

  const [mode, setMode] = useState<Mode>(isMode(initialParams.mode) ? initialParams.mode : 'albums')
  const [query, setQuery] = useState(initialParams.q ?? '')
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div style={{ rotate: '-1deg' }} className="w-fit">
        <h1 className="font-[family-name:var(--font-bungee)] text-3xl text-[#f2f2f2] sm:text-4xl">
          SEARCH
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode('albums')}
          className={cn(
            'border-2 border-black px-5 py-2 font-[family-name:var(--font-archivo)] text-sm font-bold uppercase tracking-wide transition-transform',
            mode === 'albums'
              ? 'bg-[#ffe000] text-[#0a0a0a] shadow-[4px_4px_0_#ff2b2b]'
              : 'bg-[#141414] text-[#f2f2f2] border-[#f2f2f2]',
          )}
        >
          Albums
        </button>
        <button
          type="button"
          onClick={() => setMode('people')}
          className={cn(
            'border-2 border-black px-5 py-2 font-[family-name:var(--font-archivo)] text-sm font-bold uppercase tracking-wide transition-transform',
            mode === 'people'
              ? 'bg-[#2ee6ff] text-[#0a0a0a] shadow-[4px_4px_0_#2b6bff]'
              : 'bg-[#141414] text-[#f2f2f2] border-[#f2f2f2]',
          )}
        >
          People
        </button>
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={mode === 'albums' ? 'Search albums or artists…' : 'Search people…'}
        autoFocus
        className="w-full border-2 border-black bg-[#f2f2f2] px-4 py-3 font-[family-name:var(--font-space-mono)] text-base text-[#0a0a0a] placeholder:text-[#0a0a0a]/50 shadow-[4px_4px_0_#2b6bff] focus:outline-none"
      />

      {/* Results */}
      <div className="space-y-3">
        {showEmptyPrompt && (
          <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#f2f2f2]/70">
            Search for an album or a person.
          </p>
        )}

        {!showEmptyPrompt && loading && (
          <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#f2f2f2]/70">
            Searching…
          </p>
        )}

        {showNoResults && (
          <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#f2f2f2]/70">
            No matches for &lsquo;{trimmedQuery}&rsquo;.
          </p>
        )}

        {!showEmptyPrompt && !loading && mode === 'albums' && albumResults.length > 0 && (
          <ul className="space-y-3">
            {albumResults.map((album, index) => (
              <li key={album.id}>
                <Link
                  href={`/album/${album.id}`}
                  className="flex items-center gap-4 border-2 border-black bg-[#f2f2f2] p-3 shadow-[4px_4px_0_#ffe000] transition-transform hover:-translate-y-0.5"
                  style={{ rotate: index % 2 === 0 ? '-0.5deg' : '0.5deg' }}
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 border-black bg-[#0a0a0a]">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={`${album.title} cover art`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-[family-name:var(--font-archivo)] font-bold text-[#0a0a0a]">
                      {album.title}
                    </p>
                    <p className="truncate font-[family-name:var(--font-space-mono)] text-sm text-[#0a0a0a]/70">
                      {album.artist}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!showEmptyPrompt && !loading && mode === 'people' && peopleResults.length > 0 && (
          <ul className="space-y-3">
            {peopleResults.map((profile, index) => (
              <li key={profile.id}>
                <Link
                  href={`/profile/${profile.username ?? ''}`}
                  className="flex items-center gap-4 border-2 border-black bg-[#f2f2f2] p-3 shadow-[4px_4px_0_#2ee6ff] transition-transform hover:-translate-y-0.5"
                  style={{ rotate: index % 2 === 0 ? '-0.5deg' : '0.5deg' }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-black object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#ffe000] font-[family-name:var(--font-bungee)] text-[#0a0a0a]">
                      {(profile.username ?? '?')[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <p className="truncate font-[family-name:var(--font-archivo)] font-bold text-[#0a0a0a]">
                    {profile.username ?? 'Unknown'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
