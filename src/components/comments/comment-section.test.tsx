import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CommentSection } from './comment-section'
import type { CommentWithAuthor } from '@/lib/comments/actions'

vi.mock('@/lib/comments/actions', () => ({
  listComments: vi.fn(),
  addComment: vi.fn(),
}))

const existingComment: CommentWithAuthor = {
  id: 'comment-1',
  content: 'Love this record.',
  createdAt: '2026-07-01T00:00:00.000Z',
  profileId: 'user-1',
  parentCommentId: null,
  username: 'listener',
  avatarUrl: null,
}

const newComment: CommentWithAuthor = {
  id: 'comment-2',
  content: 'Same!',
  createdAt: '2026-07-02T00:00:00.000Z',
  profileId: 'user-2',
  parentCommentId: null,
  username: 'other-listener',
  avatarUrl: null,
}

describe('CommentSection', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows only the count when collapsed and does not fetch comments', async () => {
    const { listComments } = await import('@/lib/comments/actions')

    render(<CommentSection reviewId="review-1" initialCount={3} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '💬 REPLY' })).toBeInTheDocument()
    expect(screen.queryByText('Love this record.')).not.toBeInTheDocument()
    expect(listComments).not.toHaveBeenCalled()
  })

  it('fetches and renders top-level replies on first expand, without re-fetching on later toggles', async () => {
    const { listComments } = await import('@/lib/comments/actions')
    vi.mocked(listComments).mockResolvedValue([existingComment])

    render(<CommentSection reviewId="review-1" initialCount={1} />)

    await userEvent.click(screen.getByText('1'))

    expect(await screen.findByText('Love this record.')).toBeInTheDocument()
    expect(listComments).toHaveBeenCalledTimes(1)
    expect(listComments).toHaveBeenCalledWith('review-1')

    // collapse then re-expand — should not re-fetch
    await userEvent.click(screen.getByText('1'))
    expect(screen.queryByText('Love this record.')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('1'))
    expect(screen.getByText('Love this record.')).toBeInTheDocument()
    expect(listComments).toHaveBeenCalledTimes(1)
  })

  it('does not render nested replies inline, only top-level ones', async () => {
    const { listComments } = await import('@/lib/comments/actions')
    const nested: CommentWithAuthor = { ...newComment, id: 'comment-3', parentCommentId: 'comment-1' }
    vi.mocked(listComments).mockResolvedValue([existingComment, nested])

    render(<CommentSection reviewId="review-1" initialCount={2} />)

    await userEvent.click(screen.getByText('2'))

    expect(await screen.findByText('Love this record.')).toBeInTheDocument()
    expect(screen.queryByText('Same!')).not.toBeInTheDocument()
  })

  it('opens the quick-reply composer from the Reply button, posts a top-level reply, and shows it in the expanded list', async () => {
    const { listComments, addComment } = await import('@/lib/comments/actions')
    vi.mocked(listComments).mockResolvedValue([existingComment])
    vi.mocked(addComment).mockResolvedValue(newComment)

    render(<CommentSection reviewId="review-1" initialCount={1} />)

    await userEvent.click(screen.getByRole('button', { name: '💬 REPLY' }))
    await userEvent.type(screen.getByPlaceholderText('Say something…'), 'Same!')
    await userEvent.click(screen.getByRole('button', { name: 'POST' }))

    expect(addComment).toHaveBeenCalledWith('review-1', 'Same!', null)
    expect(await screen.findByText('Same!')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('links to the dedicated thread page', () => {
    render(<CommentSection reviewId="review-1" initialCount={0} />)

    const link = screen.getByRole('link', { name: 'View thread' })
    expect(link).toHaveAttribute('href', '/review/review-1')
  })
})
