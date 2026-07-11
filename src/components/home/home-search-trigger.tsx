'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearch } from '@/hooks/use-search'
import { cn } from '@/lib/utils'
import { PunkPressButton } from '@/components/marketing/punk-press-button'
import { SearchResults } from '@/components/search/search-results'

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
      <PunkPressButton
        onClick={() => setIsOpen((v) => !v)}
        accent="yellow"
        size={3}
        border={2}
        className="flex w-full items-center gap-2.5 bg-paper text-ink border-black px-3 py-2.5 font-punk-mono text-xs transition-transform hover:scale-105"
      >
        <span>⌕</span> SEARCH ALBUMS, PEOPLE…
      </PunkPressButton>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-105 max-w-[90vw] space-y-3 border-2 border-black bg-ink p-4 shadow-hard-6-ink">
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

          <SearchResults
            variant="compact"
            mode={mode}
            albumResults={albumResults}
            peopleResults={peopleResults}
            loading={loading}
            trimmedQuery={trimmedQuery}
            showEmptyPrompt={showEmptyPrompt}
            showNoResults={showNoResults}
            onSelect={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
