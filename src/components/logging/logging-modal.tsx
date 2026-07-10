'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StarRatingInput } from './star-rating-input'
import { searchAlbums, getAlbumDetails, getAlbumTracks } from '@/lib/spotify/actions'
import { submitLog, type TrackRatingInput } from '@/lib/logging/actions'
import type { AlbumSearchResult, AlbumTrack } from '@/lib/spotify/types'
import { cn } from '@/lib/utils'
import { PunkPressButton } from '@/components/marketing/punk-press-button'

interface TrackState {
  rating: number | null
  notes: string
}

export function LoggingModal({
  open,
  onOpenChange,
  initialAlbumId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAlbumId?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AlbumSearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [album, setAlbum] = useState<AlbumSearchResult | null>(null)
  const [tracks, setTracks] = useState<AlbumTrack[]>([])
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null)
  const [trackState, setTrackState] = useState<Record<number, TrackState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    reset()
    if (initialAlbumId) {
      getAlbumDetails(initialAlbumId).then((details) => {
        if (details) selectAlbum(details)
      })
    }
  }, [open, initialAlbumId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }
      searchAlbums(query).then(setResults)
    }, 250)
    return () => clearTimeout(timeout)
  }, [query])

  function reset() {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    setAlbum(null)
    setTracks([])
    setRating(0)
    setReview('')
    setExpandedTrack(null)
    setTrackState({})
    setError(null)
  }

  function selectAlbum(selected: AlbumSearchResult) {
    setAlbum(selected)
    setQuery('')
    setShowDropdown(false)
    setTracks([])
    getAlbumTracks(selected.id)
      .then((t) => {
        setTracks(t)
      })
  }

  function setTrackRating(trackNumber: number, value: number) {
    setTrackState((s) => ({ ...s, [trackNumber]: { rating: value, notes: s[trackNumber]?.notes ?? '' } }))
  }

  function setTrackNotes(trackNumber: number, notes: string) {
    setTrackState((s) => ({ ...s, [trackNumber]: { rating: s[trackNumber]?.rating ?? null, notes } }))
  }

  async function handleSubmit() {
    if (!album || rating === 0) return
    setSubmitting(true)
    setError(null)

    const trackRatings: TrackRatingInput[] = tracks.map((t) => ({
      trackNumber: t.trackNumber,
      rating: trackState[t.trackNumber]?.rating ?? null,
      notes: trackState[t.trackNumber]?.notes ?? '',
    }))

    try {
      await submitLog({ albumId: album.id, rating, review, trackRatings })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none w-215 sm:max-w-215 max-h-[92vh] overflow-y-auto rounded-none bg-ink p-0 border-punk border-black shadow-hard-9-blue gap-0 text-paper"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b-punk border-black bg-ink">
          <div
            className="font-display text-xl"
            style={{ color: 'var(--color-brand-yellow)', textShadow: '2.5px 2.5px 0 var(--color-brand-red)', rotate: '-1deg' }}
          >
            LOG A LISTEN
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="w-8 h-8 border-2 border-paper text-paper shadow-[3px_3px_0_var(--color-paper)] font-display transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            ✕
          </button>
        </div>

        <div className={cn('px-6 pt-5 relative', !album && 'min-h-70')}>
          <div className="flex items-center gap-2.5 bg-paper border-2 border-black shadow-hard-4-yellow px-3.5 py-2.5">
            <span className="text-ink">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="SEARCH ALBUMS, ARTISTS…"
              className="flex-1 bg-transparent border-none outline-none text-ink text-sm font-punk-mono"
            />
          </div>

          {showDropdown && results.length > 0 && (
            <div className="absolute left-6 right-6 top-17.5 z-20 bg-paper border-2 border-black shadow-hard-5-ink overflow-hidden">
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => selectAlbum(r)}
                  className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer border-b-2 border-black last:border-b-0"
                >
                  <div
                    className="w-9.5 h-9.5 border-2 border-black shrink-0 bg-cover bg-center"
                    style={r.coverUrl ? { backgroundImage: `url(${r.coverUrl})` } : { background: 'var(--color-ink-200)' }}
                  />
                  <div className="leading-tight">
                    <div className="font-punk-mono font-bold text-sm text-ink">
                      {r.title}
                    </div>
                    <div className="text-ink-600 font-punk-mono text-xs">{r.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {album && (
          <>
            <div className="grid grid-cols-[220px_1fr] gap-6 px-6 py-6">
              <div>
                <div
                  className="w-55 h-55 border-punk border-black shadow-hard-6-red bg-cover bg-center"
                  style={album.coverUrl ? { backgroundImage: `url(${album.coverUrl})` } : { background: 'var(--color-ink-800)' }}
                />
                <div className="mt-3 font-display text-base">{album.title}</div>
                <div className="font-punk-mono text-11-5 text-ink-600 mt-1">
                  {album.artist}
                  {album.releaseDate ? ` · ${album.releaseDate.slice(0, 4)}` : ''}
                </div>
              </div>

              <div>
                <div
                  className="font-display text-13 mb-2.5"
                  style={{ color: 'var(--color-brand-yellow)', textShadow: '2px 2px 0 var(--color-brand-blue)' }}
                >
                  YOUR RATING
                </div>
                <div className="flex items-center gap-1.5 mb-5">
                  <StarRatingInput value={rating} onChange={setRating} label="Your rating" />
                  <span className="font-punk-mono font-bold text-sm ml-2">
                    {rating ? rating.toFixed(1) : '—'}
                  </span>
                </div>

                <div
                  className="font-display text-13 mb-2.5"
                  style={{ color: 'var(--color-brand-yellow)', textShadow: '2px 2px 0 var(--color-brand-red)' }}
                >
                  YOUR REVIEW
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={5}
                  placeholder="What did you think? (no spoilers up top…)"
                  className="w-full box-border bg-paper border-2 border-black shadow-hard-4-blue px-3.5 py-3 text-ink text-sm leading-relaxed font-punk-mono"
                />
              </div>
            </div>

            {tracks.length > 0 && (
              <div className="px-6 pb-6">
                <div
                  className="font-display text-15 mb-3"
                  style={{ color: 'var(--color-brand-yellow)', textShadow: '2px 2px 0 var(--color-brand-red)' }}
                >
                  TRACK BY TRACK
                </div>

                {tracks.map((track, i) => {
                  const accents = ['var(--color-brand-red)', 'var(--color-brand-blue)', 'var(--color-brand-yellow)']
                  const accent = accents[i % accents.length]
                  const expanded = expandedTrack === track.trackNumber
                  const state = trackState[track.trackNumber]

                  return (
                    <div
                      key={track.trackNumber}
                      className="bg-ink border-2 border-black mb-2.5 overflow-hidden"
                      style={{ boxShadow: `4px 4px 0 ${accent}` }}
                    >
                      <div
                        onClick={() => setExpandedTrack(expanded ? null : track.trackNumber)}
                        className="flex items-center gap-3 px-3.5 py-3 cursor-pointer"
                        style={{ borderLeft: `8px solid ${accent}` }}
                      >
                        <span className="font-punk-mono font-bold text-11-5 text-ink-500 w-4.5">
                          {String(track.trackNumber).padStart(2, '0')}
                        </span>
                        <span className="flex-1 font-body text-13-5 font-extrabold">
                          {track.title}
                        </span>
                        <span className="font-punk-mono text-11-5 text-ink-500">
                          {formatDuration(track.durationMs)}
                        </span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <StarRatingInput
                            value={state?.rating ?? 0}
                            onChange={(v) => setTrackRating(track.trackNumber, v)}
                            size="sm"
                            label={`Rating for ${track.title}`}
                          />
                        </span>
                        <span className="font-display text-11 w-3.5 text-center">
                          {expanded ? '▾' : '▸'}
                        </span>
                      </div>

                      {expanded && (
                        <div className="px-3.5 pb-3.5 pl-6">
                          <textarea
                            value={state?.notes ?? ''}
                            onChange={(e) => setTrackNotes(track.trackNumber, e.target.value)}
                            rows={2}
                            placeholder="Notes on this track…"
                            className="w-full box-border bg-ink-900 border-2 border-black px-3 py-2.5 text-paper text-xs leading-relaxed font-punk-mono"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {error && <p className="px-6 pb-3 text-sm text-red-400">{error}</p>}

        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t-punk border-black bg-ink">
          <PunkPressButton
            onClick={() => onOpenChange(false)}
            accent="ink"
            size={3}
            border={2}
            className="bg-paper text-ink border-black font-display text-xs px-5 py-3 transition-transform"
          >
            CANCEL
          </PunkPressButton>
          <PunkPressButton
            disabled={!album || rating === 0 || submitting}
            onClick={handleSubmit}
            accent="red"
            size={4}
            border={2}
            className="bg-brand-yellow text-ink border-black font-display text-sm px-6 py-3 transition-transform disabled:opacity-50"
          >
            {submitting ? 'SAVING…' : '▶ SAVE REVIEW'}
          </PunkPressButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
