'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearch, isSearchMode } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>
}) {
  const initialParams = use(searchParams)

  const {
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
  } = useSearch({
    mode: isSearchMode(initialParams.mode) ? initialParams.mode : 'albums',
    query: initialParams.q ?? '',
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div style={{ rotate: '-1deg' }} className="w-fit">
        <h1 className="font-display text-3xl text-paper sm:text-4xl">
          SEARCH
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode('albums')}
          className={cn(
            'border-2 border-black px-5 py-2 font-body text-sm font-bold uppercase tracking-wide transition-transform',
            mode === 'albums'
              ? 'bg-brand-yellow text-ink shadow-hard-4-red'
              : 'bg-ink-900 text-paper border-paper',
          )}
        >
          Albums
        </button>
        <button
          type="button"
          onClick={() => setMode('people')}
          className={cn(
            'border-2 border-black px-5 py-2 font-body text-sm font-bold uppercase tracking-wide transition-transform',
            mode === 'people'
              ? 'bg-brand-cyan text-ink shadow-hard-4-blue'
              : 'bg-ink-900 text-paper border-paper',
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
        className="w-full border-2 border-black bg-paper px-4 py-3 font-punk-mono text-base text-ink placeholder:text-ink/50 shadow-hard-4-blue focus:outline-none"
      />

      {/* Results */}
      <div className="space-y-3">
        {showEmptyPrompt && (
          <p className="font-punk-mono text-sm text-paper/70">
            Search for an album or a person.
          </p>
        )}

        {!showEmptyPrompt && loading && (
          <p className="font-punk-mono text-sm text-paper/70">
            Searching…
          </p>
        )}

        {showNoResults && (
          <p className="font-punk-mono text-sm text-paper/70">
            No matches for &lsquo;{trimmedQuery}&rsquo;.
          </p>
        )}

        {!showEmptyPrompt && !loading && mode === 'albums' && albumResults.length > 0 && (
          <ul className="space-y-3">
            {albumResults.map((album, index) => (
              <li key={album.id}>
                <Link
                  href={`/album/${album.id}`}
                  className="flex items-center gap-4 border-2 border-black bg-paper p-3 shadow-hard-4-yellow transition-transform hover:-translate-y-0.5"
                  style={{ rotate: index % 2 === 0 ? '-0.5deg' : '0.5deg' }}
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden border-2 border-black bg-ink">
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
                    <p className="truncate font-body font-bold text-ink">
                      {album.title}
                    </p>
                    <p className="truncate font-punk-mono text-sm text-ink/70">
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
                  className="flex items-center gap-4 border-2 border-black bg-paper p-3 shadow-hard-4-cyan transition-transform hover:-translate-y-0.5"
                  style={{ rotate: index % 2 === 0 ? '-0.5deg' : '0.5deg' }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-black object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-black bg-brand-yellow font-display text-ink">
                      {(profile.username ?? '?')[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <p className="truncate font-body font-bold text-ink">
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
