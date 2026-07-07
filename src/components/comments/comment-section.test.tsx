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
  username: 'listener',
  avatarUrl: null,
}

const newComment: CommentWithAuthor = {
  id: 'comment-2',
  content: 'Same!',
  createdAt: '2026-07-02T00:00:00.000Z',
  profileId: 'user-2',
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

    expect(screen.getByText('💬 3')).toBeInTheDocument()
    expect(screen.queryByText('Love this record.')).not.toBeInTheDocument()
    expect(listComments).not.toHaveBeenCalled()
  })

  it('fetches and renders comments on first expand, without re-fetching on later toggles', async () => {
    const { listComments } = await import('@/lib/comments/actions')
    vi.mocked(listComments).mockResolvedValue([existingComment])

    render(<CommentSection reviewId="review-1" initialCount={1} />)

    await userEvent.click(screen.getByText('💬 1'))

    expect(await screen.findByText('Love this record.')).toBeInTheDocument()
    expect(listComments).toHaveBeenCalledTimes(1)
    expect(listComments).toHaveBeenCalledWith('review-1')

    // collapse then re-expand — should not re-fetch
    await userEvent.click(screen.getByText('💬 1'))
    expect(screen.queryByText('Love this record.')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('💬 1'))
    expect(screen.getByText('Love this record.')).toBeInTheDocument()
    expect(listComments).toHaveBeenCalledTimes(1)
  })

  it('appends a newly added comment and increments the count without re-fetching', async () => {
    const { listComments, addComment } = await import('@/lib/comments/actions')
    vi.mocked(listComments).mockResolvedValue([existingComment])
    vi.mocked(addComment).mockResolvedValue(newComment)

    render(<CommentSection reviewId="review-1" initialCount={1} />)

    await userEvent.click(screen.getByText('💬 1'))
    await screen.findByText('Love this record.')

    await userEvent.type(screen.getByPlaceholderText('Say something…'), 'Same!')
    await userEvent.click(screen.getByRole('button', { name: 'POST' }))

    expect(await screen.findByText('Same!')).toBeInTheDocument()
    expect(screen.getByText('💬 2')).toBeInTheDocument()
    expect(listComments).toHaveBeenCalledTimes(1)
  })
})
