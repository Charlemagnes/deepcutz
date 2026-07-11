'use client'

import { use } from 'react'
import { useSearch, isSearchMode } from '@/hooks/use-search'
import { cn } from '@/lib/utils'
import { SearchResults } from '@/components/search/search-results'

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
      <SearchResults
        variant="full"
        mode={mode}
        albumResults={albumResults}
        peopleResults={peopleResults}
        loading={loading}
        trimmedQuery={trimmedQuery}
        showEmptyPrompt={showEmptyPrompt}
        showNoResults={showNoResults}
      />
    </div>
  )
}
