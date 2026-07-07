import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CommentForm } from './comment-form'
import type { CommentWithAuthor } from '@/lib/comments/actions'

vi.mock('@/lib/comments/actions', () => ({
  addComment: vi.fn(),
}))

const newComment: CommentWithAuthor = {
  id: 'comment-1',
  content: 'Great record.',
  createdAt: '2026-07-01T00:00:00.000Z',
  profileId: 'user-1',
  username: 'listener',
  avatarUrl: null,
}

describe('CommentForm', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('disables submit when the textarea is empty or whitespace-only', async () => {
    render(<CommentForm reviewId="review-1" onAdded={vi.fn()} />)

    const submit = screen.getByRole('button', { name: 'POST' })
    expect(submit).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText('Say something…'), '   ')
    expect(submit).toBeDisabled()
  })

  it('submits trimmed content, calls onAdded, and clears the textarea', async () => {
    const { addComment } = await import('@/lib/comments/actions')
    vi.mocked(addComment).mockResolvedValue(newComment)
    const onAdded = vi.fn()

    render(<CommentForm reviewId="review-1" onAdded={onAdded} />)

    const textarea = screen.getByPlaceholderText('Say something…')
    await userEvent.type(textarea, '  Great record.  ')

    const submit = screen.getByRole('button', { name: 'POST' })
    expect(submit).not.toBeDisabled()
    await userEvent.click(submit)

    expect(addComment).toHaveBeenCalledWith('review-1', 'Great record.')
    expect(onAdded).toHaveBeenCalledWith(newComment)
    expect(textarea).toHaveValue('')
  })
})
