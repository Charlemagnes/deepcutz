'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearch } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

export function HomeSearchTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
  } = useSearch()

  useEffect(() => {
    if (!isOpen) return

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 bg-paper text-ink border-2 border-black shadow-hard-3-yellow px-3 py-2.5 font-punk-mono text-xs transition-transform hover:scale-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <span>⌕</span> SEARCH ALBUMS, PEOPLE…
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-105 max-w-[90vw] space-y-3 border-2 border-black bg-ink p-4 shadow-[6px_6px_0_#000]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('albums')}
              className={cn(
                'border-2 border-black px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide transition-transform',
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
                'border-2 border-black px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide transition-transform',
                mode === 'people'
                  ? 'bg-brand-cyan text-ink shadow-hard-4-blue'
                  : 'bg-ink-900 text-paper border-paper',
              )}
            >
              People
            </button>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'albums' ? 'Search albums or artists…' : 'Search people…'}
            autoFocus
            className="w-full border-2 border-black bg-paper px-3 py-2.5 font-punk-mono text-sm text-ink placeholder:text-ink/50 shadow-hard-4-blue focus:outline-none"
          />

          <div className="max-h-90 space-y-2 overflow-y-auto">
            {showEmptyPrompt && (
              <p className="font-punk-mono text-xs text-paper/70">
                Search for an album or a person.
              </p>
            )}

            {!showEmptyPrompt && loading && (
              <p className="font-punk-mono text-xs text-paper/70">
                Searching…
              </p>
            )}

            {showNoResults && (
              <p className="font-punk-mono text-xs text-paper/70">
                No matches for &lsquo;{trimmedQuery}&rsquo;.
              </p>
            )}

            {!showEmptyPrompt && !loading && mode === 'albums' && albumResults.length > 0 && (
              <ul className="space-y-2">
                {albumResults.map((album) => (
                  <li key={album.id}>
                    <Link
                      href={`/album/${album.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 border-2 border-black bg-paper p-2 shadow-hard-3-yellow transition-transform hover:-translate-y-0.5"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden border-2 border-black bg-ink">
                        {album.coverUrl ? (
                          <Image
                            src={album.coverUrl}
                            alt={`${album.title} cover art`}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-body font-bold text-sm text-ink">
                          {album.title}
                        </p>
                        <p className="truncate font-punk-mono text-xs text-ink/70">
                          {album.artist}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!showEmptyPrompt && !loading && mode === 'people' && peopleResults.length > 0 && (
              <ul className="space-y-2">
                {peopleResults.map((profile) => (
                  <li key={profile.id}>
                    <Link
                      href={`/profile/${profile.username ?? ''}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 border-2 border-black bg-paper p-2 shadow-hard-3-cyan transition-transform hover:-translate-y-0.5"
                    >
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="h-9 w-9 flex-shrink-0 rounded-full border-2 border-black object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-black bg-brand-yellow font-display text-ink">
                          {(profile.username ?? '?')[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <p className="truncate font-body font-bold text-sm text-ink">
                        {profile.username ?? 'Unknown'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
