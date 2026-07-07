import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomeSearchTrigger } from './home-search-trigger'
import type { AlbumSearchResult } from '@/lib/spotify/types'

vi.mock('@/lib/spotify/actions', () => ({
  searchAlbums: vi.fn(),
}))

vi.mock('@/lib/profiles/actions', () => ({
  searchProfiles: vi.fn(),
}))

const album: AlbumSearchResult = {
  id: 'album-1',
  title: 'The Overload',
  artist: 'Yard Act',
  coverUrl: null,
  releaseDate: '2022-01-01',
}

describe('HomeSearchTrigger', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('is closed by default and opens the overlay on click', async () => {
    const user = userEvent.setup()
    render(<HomeSearchTrigger />)

    expect(screen.queryByPlaceholderText('Search albums or artists…')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /search albums, people/i }))

    expect(screen.getByPlaceholderText('Search albums or artists…')).toBeInTheDocument()
  })

  it('closes the overlay when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<HomeSearchTrigger />)

    await user.click(screen.getByRole('button', { name: /search albums, people/i }))
    expect(screen.getByPlaceholderText('Search albums or artists…')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search albums or artists…')).not.toBeInTheDocument()
    })
  })

  it('closes the overlay on an outside click', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <HomeSearchTrigger />
        <button type="button">outside</button>
      </div>,
    )

    await user.click(screen.getByRole('button', { name: /search albums, people/i }))
    expect(screen.getByPlaceholderText('Search albums or artists…')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search albums or artists…')).not.toBeInTheDocument()
    })
  })

  it('shows album results from a mocked searchAlbums', async () => {
    const { searchAlbums } = await import('@/lib/spotify/actions')
    vi.mocked(searchAlbums).mockResolvedValue([album])

    const user = userEvent.setup()
    render(<HomeSearchTrigger />)

    await user.click(screen.getByRole('button', { name: /search albums, people/i }))
    await user.type(screen.getByPlaceholderText('Search albums or artists…'), 'overload')

    await waitFor(() => {
      expect(screen.getByText('The Overload')).toBeInTheDocument()
    })
    expect(screen.getByText('Yard Act')).toBeInTheDocument()
  })
})
