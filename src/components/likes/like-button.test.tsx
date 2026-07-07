import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LikeButton } from './like-button'

vi.mock('@/lib/likes/actions', () => ({
  toggleLike: vi.fn(),
}))

describe('LikeButton', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders the initial count and unliked state', () => {
    render(<LikeButton reviewId="review-1" initialLiked={false} initialCount={3} />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('♡')
    expect(button).toHaveTextContent('3')
  })

  it('renders the initial liked state', () => {
    render(<LikeButton reviewId="review-1" initialLiked initialCount={5} />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('♥')
    expect(button).toHaveTextContent('5')
  })

  it('calls toggleLike and updates the displayed state from its result', async () => {
    const { toggleLike } = await import('@/lib/likes/actions')
    vi.mocked(toggleLike).mockResolvedValue({ liked: true, likeCount: 4 })

    render(<LikeButton reviewId="review-1" initialLiked={false} initialCount={3} />)

    await userEvent.click(screen.getByRole('button'))

    expect(toggleLike).toHaveBeenCalledWith('review-1')
    const button = await screen.findByRole('button')
    expect(button).toHaveTextContent('♥')
    expect(button).toHaveTextContent('4')
  })

  it('disables the button while the toggleLike promise is pending', async () => {
    const { toggleLike } = await import('@/lib/likes/actions')
    let resolvePromise: (value: { liked: boolean; likeCount: number }) => void = () => {}
    vi.mocked(toggleLike).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        })
    )

    render(<LikeButton reviewId="review-1" initialLiked={false} initialCount={3} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(button).toBeDisabled()

    resolvePromise({ liked: true, likeCount: 4 })

    await screen.findByText('4')
    expect(button).not.toBeDisabled()
  })
})
