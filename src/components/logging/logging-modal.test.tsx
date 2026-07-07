import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoggingModal } from './logging-modal'
import type { AlbumSearchResult, AlbumTrack } from '@/lib/spotify/types'

vi.mock('@/lib/spotify/actions', () => ({
  searchAlbums: vi.fn(),
  getAlbumDetails: vi.fn(),
  getAlbumTracks: vi.fn(),
}))

vi.mock('@/lib/logging/actions', () => ({
  submitLog: vi.fn(),
}))

const album: AlbumSearchResult = {
  id: 'album-1',
  title: 'The Overload',
  artist: 'Yard Act',
  coverUrl: null,
  releaseDate: '2022-01-01',
}

const tracks: AlbumTrack[] = [
  { trackNumber: 1, title: 'Dead Horse', durationMs: 192000 },
  { trackNumber: 2, title: 'Payday', durationMs: 178000 },
]

function mockStarWidth(width = 30) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    left: 0,
    top: 0,
    height: width,
    right: width,
    bottom: width,
    x: 0,
    y: 0,
    toJSON() {},
  })
}

describe('LoggingModal', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('searches for an album, selects it, and loads its tracks', async () => {
    const { searchAlbums } = await import('@/lib/spotify/actions')
    const { getAlbumTracks } = await import('@/lib/spotify/actions')
    vi.mocked(searchAlbums).mockResolvedValue([album])
    vi.mocked(getAlbumTracks).mockResolvedValue(tracks)

    render(<LoggingModal open onOpenChange={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText('SEARCH ALBUMS, ARTISTS…'), 'overload')

    const result = await screen.findByText('The Overload')
    await userEvent.click(result)

    expect(screen.getAllByText('The Overload').length).toBeGreaterThan(0)
    await screen.findByText('Dead Horse')
    expect(screen.getByText('Payday')).toBeInTheDocument()
  })

  it('expands a track row to reveal its notes field and rates it', async () => {
    const { searchAlbums, getAlbumTracks } = await import('@/lib/spotify/actions')
    vi.mocked(searchAlbums).mockResolvedValue([album])
    vi.mocked(getAlbumTracks).mockResolvedValue(tracks)
    mockStarWidth()

    render(<LoggingModal open onOpenChange={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('SEARCH ALBUMS, ARTISTS…'), 'overload')
    await userEvent.click(await screen.findByText('The Overload'))
    await screen.findByText('Dead Horse')

    expect(screen.queryByPlaceholderText('Notes on this track…')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Dead Horse'))
    expect(screen.getByPlaceholderText('Notes on this track…')).toBeInTheDocument()
  })

  it('submits with the album rating, review, and any rated tracks', async () => {
    const { searchAlbums, getAlbumTracks } = await import('@/lib/spotify/actions')
    const { submitLog } = await import('@/lib/logging/actions')
    vi.mocked(searchAlbums).mockResolvedValue([album])
    vi.mocked(getAlbumTracks).mockResolvedValue(tracks)
    vi.mocked(submitLog).mockResolvedValue({ reviewId: 'review-1' })
    mockStarWidth()

    const onOpenChange = vi.fn()
    render(<LoggingModal open onOpenChange={onOpenChange} />)
    await userEvent.type(screen.getByPlaceholderText('SEARCH ALBUMS, ARTISTS…'), 'overload')
    await userEvent.click(await screen.findByText('The Overload'))
    await screen.findByText('Dead Horse')

    // Album-level rating: click the right half of the 4th star -> 4.0
    const overallSlider = screen.getAllByRole('slider', { name: 'Your rating' })[0]
    fireEvent.click(within(overallSlider).getByTestId('star-3'), { clientX: 25 })

    await userEvent.type(screen.getByPlaceholderText(/no spoilers/i), 'Great post-punk record.')

    // Expand and rate the first track: left half of its 5th star -> 4.5
    await userEvent.click(screen.getByText('Dead Horse'))
    const trackSlider = screen.getByRole('slider', { name: 'Rating for Dead Horse' })
    fireEvent.click(within(trackSlider).getByTestId('star-4'), { clientX: 5 })

    await userEvent.click(screen.getByText('▶ SAVE REVIEW'))

    expect(submitLog).toHaveBeenCalledWith({
      albumId: 'album-1',
      rating: 4,
      review: 'Great post-punk record.',
      trackRatings: [
        { trackNumber: 1, rating: 4.5, notes: '' },
        { trackNumber: 2, rating: null, notes: '' },
      ],
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
