import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LiveFeed } from './live-feed'
import { getFeedReviewById } from '@/lib/reviews/actions'

vi.mock('@/lib/reviews/actions', () => ({
  getFeedReviewById: vi.fn(),
}))

type Handler = (payload: { new: { id: string } }) => void

let capturedHandler: Handler | null = null
const removeChannel = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => ({
      on: (_event: string, _filter: unknown, handler: Handler) => {
        capturedHandler = handler
        return { subscribe: () => ({}) }
      },
    }),
    removeChannel,
  }),
}))

function album(id: string) {
  return { id, title: `Album ${id}`, artist: `Artist ${id}`, cover_url: null }
}

function reviewItem(id: string, opts: { username?: string } = {}) {
  return {
    kind: 'review' as const,
    id,
    createdAt: '2026-07-07T00:00:00.000Z',
    rating: 4,
    content: 'great record',
    isSpoiler: false,
    likeCount: 0,
    commentCount: 0,
    album: album(`${id}-album`),
    author: { username: opts.username ?? 'someone', avatar_url: null },
  }
}

const VIEWER_ID = 'viewer-1'

beforeEach(() => {
  window.scrollTo = vi.fn()
})

afterEach(() => {
  vi.resetAllMocks()
  capturedHandler = null
})

const EMPTY_STATE = <div>EMPTY STATE</div>

describe('LiveFeed', () => {
  it('renders the initial items', () => {
    render(
      <LiveFeed
        initialItems={[reviewItem('r1')]}
        likedReviewIds={new Set()}
        feedProfileIds={[VIEWER_ID]}
        userId={VIEWER_ID}
        emptyState={EMPTY_STATE}
        followNudge={null}
      />,
    )

    expect(screen.getByText('Album r1-album')).toBeInTheDocument()
  })

  it('renders the empty state when there are no items', () => {
    render(
      <LiveFeed
        initialItems={[]}
        likedReviewIds={new Set()}
        feedProfileIds={[VIEWER_ID]}
        userId={VIEWER_ID}
        emptyState={EMPTY_STATE}
        followNudge={null}
      />,
    )

    expect(screen.getByText('EMPTY STATE')).toBeInTheDocument()
  })

  it('auto-inserts a self-authored new review with no banner', async () => {
    vi.mocked(getFeedReviewById).mockResolvedValue({
      profileId: VIEWER_ID,
      item: reviewItem('new-own', { username: 'me' }),
    })

    render(
      <LiveFeed
        initialItems={[]}
        likedReviewIds={new Set()}
        feedProfileIds={[VIEWER_ID]}
        userId={VIEWER_ID}
        emptyState={EMPTY_STATE}
        followNudge={null}
      />,
    )

    expect(capturedHandler).not.toBeNull()
    await act(async () => {
      await capturedHandler!({ new: { id: 'new-own' } })
    })

    expect(await screen.findByText('Album new-own-album')).toBeInTheDocument()
    expect(screen.queryByText(/NEW REVIEW/)).not.toBeInTheDocument()
  })

  it('surfaces the reveal banner for a followed-user review even when the feed started empty', async () => {
    vi.mocked(getFeedReviewById).mockResolvedValue({
      profileId: 'friend-1',
      item: reviewItem('new-friend', { username: 'friend' }),
    })

    render(
      <LiveFeed
        initialItems={[]}
        likedReviewIds={new Set()}
        feedProfileIds={[VIEWER_ID, 'friend-1']}
        userId={VIEWER_ID}
        emptyState={EMPTY_STATE}
        followNudge={null}
      />,
    )

    expect(screen.getByText('EMPTY STATE')).toBeInTheDocument()

    await act(async () => {
      await capturedHandler!({ new: { id: 'new-friend' } })
    })

    const banner = await screen.findByRole('button', { name: /1 NEW REVIEW/ })
    expect(screen.queryByText('EMPTY STATE')).not.toBeInTheDocument()
    expect(screen.queryByText('Album new-friend-album')).not.toBeInTheDocument()

    await userEvent.click(banner)

    expect(screen.getByText('Album new-friend-album')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /NEW REVIEW/ })).not.toBeInTheDocument()
  })
})
