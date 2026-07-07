import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotificationRow } from './notification-row'
import type { NotificationItem } from '@/lib/notifications/actions'

const actor: NotificationItem['actor'] = {
  id: 'actor-1',
  username: 'sidchadwick',
  avatarUrl: null,
}

const review: NonNullable<NotificationItem['review']> = {
  id: 'review-1',
  albumId: 'album-1',
  albumTitle: 'The Overload',
  albumArtist: 'Yard Act',
}

function makeItem(overrides: Partial<NotificationItem>): NotificationItem {
  return {
    id: 'notif-1',
    type: 'follow',
    createdAt: '2026-07-01T00:00:00.000Z',
    isUnread: false,
    actor,
    review: null,
    ...overrides,
  }
}

describe('NotificationRow', () => {
  it('renders a follow notification', () => {
    const item = makeItem({ type: 'follow' })
    render(<NotificationRow item={item} />)

    expect(screen.getByText('sidchadwick started following you.')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile/sidchadwick')
  })

  it('renders a like notification', () => {
    const item = makeItem({ type: 'like', review })
    render(<NotificationRow item={item} />)

    expect(
      screen.getByText('sidchadwick liked your review of The Overload.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/album/album-1#review-review-1')
  })

  it('renders a comment notification', () => {
    const item = makeItem({ type: 'comment', review })
    render(<NotificationRow item={item} />)

    expect(
      screen.getByText('sidchadwick commented on your review of The Overload.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/album/album-1#review-review-1')
  })

  it('shows the unread visual treatment only when isUnread is true', () => {
    const { rerender } = render(<NotificationRow item={makeItem({ isUnread: false })} />)
    expect(screen.queryByTestId('unread-dot')).not.toBeInTheDocument()

    rerender(<NotificationRow item={makeItem({ isUnread: true })} />)
    expect(screen.getByTestId('unread-dot')).toBeInTheDocument()
  })
})
