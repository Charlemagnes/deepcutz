import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StarRatingInput } from './star-rating-input'

/** jsdom reports 0-width elements by default; give each star a fixed 30px box so click-position math is deterministic. */
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

describe('StarRatingInput', () => {
  it('sets a half-star value when clicking the left half of a star', async () => {
    mockStarWidth()
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} label="Your rating" />)

    // 3rd star (idx 2), click at x=5 -> left half -> 2 + 0.5 = 2.5
    fireEvent.click(screen.getByTestId('star-2'), { clientX: 5 })

    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('sets a whole-star value when clicking the right half of a star', async () => {
    mockStarWidth()
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} label="Your rating" />)

    // 3rd star (idx 2), click at x=25 -> right half -> 2 + 1 = 3
    fireEvent.click(screen.getByTestId('star-2'), { clientX: 25 })

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('increments by 0.5 on ArrowRight and clamps at 5', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<StarRatingInput value={4.5} onChange={onChange} label="Your rating" />)

    await userEvent.keyboard('{Tab}')
    screen.getByRole('slider').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(5)

    rerender(<StarRatingInput value={5} onChange={onChange} label="Your rating" />)
    screen.getByRole('slider').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('decrements by 0.5 on ArrowLeft and clamps at 0.5', async () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0.5} onChange={onChange} label="Your rating" />)

    screen.getByRole('slider').focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith(0.5)
  })
})
