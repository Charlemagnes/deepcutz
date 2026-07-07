'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { StarRatingInput } from './star-rating-input'
import { searchAlbums, getAlbumDetails, getAlbumTracks } from '@/lib/spotify/actions'
import { submitLog, type TrackRatingInput } from '@/lib/logging/actions'
import type { AlbumSearchResult, AlbumTrack } from '@/lib/spotify/types'

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
        className="max-w-none w-[860px] sm:max-w-[860px] max-h-[92vh] overflow-y-auto rounded-none bg-[#0a0a0a] p-0 border-[3px] border-black shadow-[9px_9px_0_#2b6bff] gap-0 text-[#f2f2f2]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b-[3px] border-black bg-[#0a0a0a]">
          <div
            className="font-[family-name:var(--font-bungee)] text-xl"
            style={{ color: '#ffe000', textShadow: '2.5px 2.5px 0 #ff2b2b', rotate: '-1deg' }}
          >
            LOG A LISTEN
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="w-8 h-8 border-2 border-[#f2f2f2] text-[#f2f2f2] shadow-[3px_3px_0_#f2f2f2] font-[family-name:var(--font-bungee)]"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-5 relative">
          <div className="flex items-center gap-2.5 bg-[#f2f2f2] border-2 border-black shadow-[4px_4px_0_#ffe000] px-3.5 py-2.5">
            <span className="text-[#0a0a0a]">⌕</span>
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
              className="flex-1 bg-transparent border-none outline-none text-[#0a0a0a] text-sm font-[family-name:var(--font-space-mono)]"
            />
          </div>

          {showDropdown && results.length > 0 && (
            <div className="absolute left-6 right-6 top-[70px] z-20 bg-[#f2f2f2] border-2 border-black shadow-[5px_5px_0_#000] overflow-hidden">
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => selectAlbum(r)}
                  className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer border-b-2 border-black last:border-b-0"
                >
                  <div
                    className="w-[38px] h-[38px] border-2 border-black shrink-0 bg-cover bg-center"
                    style={r.coverUrl ? { backgroundImage: `url(${r.coverUrl})` } : { background: '#ccc' }}
                  />
                  <div className="leading-tight">
                    <div className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#0a0a0a]">
                      {r.title}
                    </div>
                    <div className="text-[#666] font-[family-name:var(--font-space-mono)] text-xs">{r.artist}</div>
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
                  className="w-[220px] h-[220px] border-[3px] border-black shadow-[6px_6px_0_#ff2b2b] bg-cover bg-center"
                  style={album.coverUrl ? { backgroundImage: `url(${album.coverUrl})` } : { background: '#333' }}
                />
                <div className="mt-3 font-[family-name:var(--font-bungee)] text-base">{album.title}</div>
                <div className="font-[family-name:var(--font-space-mono)] text-[11.5px] text-[#555] mt-1">
                  {album.artist}
                  {album.releaseDate ? ` · ${album.releaseDate.slice(0, 4)}` : ''}
                </div>
              </div>

              <div>
                <div
                  className="font-[family-name:var(--font-bungee)] text-[13px] mb-2.5"
                  style={{ color: '#ffe000', textShadow: '2px 2px 0 #2b6bff' }}
                >
                  YOUR RATING
                </div>
                <div className="flex items-center gap-1.5 mb-5">
                  <StarRatingInput value={rating} onChange={setRating} label="Your rating" />
                  <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm ml-2">
                    {rating ? rating.toFixed(1) : '—'}
                  </span>
                </div>

                <div
                  className="font-[family-name:var(--font-bungee)] text-[13px] mb-2.5"
                  style={{ color: '#ffe000', textShadow: '2px 2px 0 #ff2b2b' }}
                >
                  YOUR REVIEW
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={5}
                  placeholder="What did you think? (no spoilers up top…)"
                  className="w-full box-border bg-[#f2f2f2] border-2 border-black shadow-[4px_4px_0_#2b6bff] px-3.5 py-3 text-[#0a0a0a] text-sm leading-relaxed font-[family-name:var(--font-space-mono)]"
                />
              </div>
            </div>

            {tracks.length > 0 && (
              <div className="px-6 pb-6">
                <div
                  className="font-[family-name:var(--font-bungee)] text-[15px] mb-3"
                  style={{ color: '#ffe000', textShadow: '2px 2px 0 #ff2b2b' }}
                >
                  TRACK BY TRACK
                </div>

                {tracks.map((track, i) => {
                  const accents = ['#ff2b2b', '#2b6bff', '#ffe000']
                  const accent = accents[i % accents.length]
                  const expanded = expandedTrack === track.trackNumber
                  const state = trackState[track.trackNumber]

                  return (
                    <div
                      key={track.trackNumber}
                      className="bg-[#0a0a0a] border-2 border-black mb-2.5 overflow-hidden"
                      style={{ boxShadow: `4px 4px 0 ${accent}` }}
                    >
                      <div
                        onClick={() => setExpandedTrack(expanded ? null : track.trackNumber)}
                        className="flex items-center gap-3 px-3.5 py-3 cursor-pointer"
                        style={{ borderLeft: `8px solid ${accent}` }}
                      >
                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-[11.5px] text-[#777] w-[18px]">
                          {String(track.trackNumber).padStart(2, '0')}
                        </span>
                        <span className="flex-1 font-[family-name:var(--font-archivo)] text-[13.5px] font-extrabold">
                          {track.title}
                        </span>
                        <span className="font-[family-name:var(--font-space-mono)] text-[11.5px] text-[#999]">
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
                        <span className="font-[family-name:var(--font-bungee)] text-[11px] w-3.5 text-center">
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
                            className="w-full box-border bg-[#171717] border-2 border-black px-3 py-2.5 text-[#f2f2f2] text-xs leading-relaxed font-[family-name:var(--font-space-mono)]"
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

        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t-[3px] border-black bg-[#0a0a0a]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#f2f2f2] border-2 border-black text-[#0a0a0a] font-[family-name:var(--font-bungee)] text-xs px-5 py-3 shadow-[3px_3px_0_#000]"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={!album || rating === 0 || submitting}
            onClick={handleSubmit}
            className="bg-[#ffe000] border-2 border-black text-[#0a0a0a] font-[family-name:var(--font-bungee)] text-sm px-6 py-3 shadow-[4px_4px_0_#ff2b2b] disabled:opacity-50"
          >
            {submitting ? 'SAVING…' : '▶ SAVE REVIEW'}
          </button>
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
