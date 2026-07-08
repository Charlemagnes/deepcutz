import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotificationBadge } from './notification-badge'
import { getUnreadNotificationCount } from '@/lib/notifications/actions'

vi.mock('@/lib/notifications/actions', () => ({
  getUnreadNotificationCount: vi.fn(),
}))

type Handler = () => void
type StatusHandler = (status: string) => void

let capturedHandler: Handler | null = null
let capturedStatusHandler: StatusHandler | null = null

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => ({
      on: (_event: string, _filter: unknown, handler: Handler) => {
        capturedHandler = handler
        return {
          subscribe: (statusHandler: StatusHandler) => {
            capturedStatusHandler = statusHandler
            statusHandler('SUBSCRIBED')
            return {}
          },
        }
      },
    }),
    removeChannel: vi.fn(),
  }),
}))

const USER_ID = 'user-1'

afterEach(() => {
  vi.resetAllMocks()
  capturedHandler = null
  capturedStatusHandler = null
})

describe('NotificationBadge', () => {
  it('renders nothing when the initial count is zero', () => {
    render(<NotificationBadge initialCount={0} userId={USER_ID} />)
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument()
  })

  it('renders the initial count', () => {
    render(<NotificationBadge initialCount={2} userId={USER_ID} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('caps the displayed count at 9+', () => {
    render(<NotificationBadge initialCount={12} userId={USER_ID} />)
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('bumps the count on a realtime INSERT event', async () => {
    render(<NotificationBadge initialCount={1} userId={USER_ID} />)
    expect(screen.getByText('1')).toBeInTheDocument()

    expect(capturedHandler).not.toBeNull()
    capturedHandler!()

    expect(await screen.findByText('2')).toBeInTheDocument()
  })

  it('reconciles the count from the server after reconnecting', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(7)

    render(<NotificationBadge initialCount={1} userId={USER_ID} />)
    expect(capturedStatusHandler).not.toBeNull()

    capturedStatusHandler!('CHANNEL_ERROR')
    capturedStatusHandler!('SUBSCRIBED')

    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalled())
    expect(await screen.findByText('7')).toBeInTheDocument()
  })
})
