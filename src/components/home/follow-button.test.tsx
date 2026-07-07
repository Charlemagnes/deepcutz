import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FollowButton } from './follow-button'

vi.mock('@/lib/follows/actions', () => ({
  toggleFollow: vi.fn(),
}))

describe('FollowButton', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows FOLLOWING immediately when initialIsFollowing is true', () => {
    render(<FollowButton profileId="profile-1" initialIsFollowing={true} />)

    expect(screen.getByText('FOLLOWING')).toBeInTheDocument()
    expect(screen.queryByText('+ FOLLOW')).not.toBeInTheDocument()
  })

  it('shows + FOLLOW immediately when initialIsFollowing is false', () => {
    render(<FollowButton profileId="profile-1" initialIsFollowing={false} />)

    expect(screen.getByText('+ FOLLOW')).toBeInTheDocument()
    expect(screen.queryByText('FOLLOWING')).not.toBeInTheDocument()
  })

  it('calls toggleFollow with profileId and updates the label from the resolved value', async () => {
    const { toggleFollow } = await import('@/lib/follows/actions')
    vi.mocked(toggleFollow).mockResolvedValue({ following: true })

    render(<FollowButton profileId="profile-1" initialIsFollowing={false} />)

    await userEvent.click(screen.getByText('+ FOLLOW'))

    expect(toggleFollow).toHaveBeenCalledWith('profile-1')
    expect(await screen.findByText('FOLLOWING')).toBeInTheDocument()
  })
})
