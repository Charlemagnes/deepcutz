import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SidebarNavLink } from './sidebar-nav-link'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('SidebarNavLink', () => {
  it('renders the badge node when passed', () => {
    render(
      <SidebarNavLink
        href="/notifications"
        label="NOTIF"
        accent="red"
        rotate={-1}
        badge={<span data-testid="badge-content">3</span>}
      />
    )

    expect(screen.getByTestId('badge-content')).toBeInTheDocument()
  })

  it('omits the badge wrapper when badge is undefined', () => {
    render(<SidebarNavLink href="/notifications" label="NOTIF" accent="red" rotate={-1} />)

    expect(screen.queryByTestId('badge-content')).not.toBeInTheDocument()
    expect(screen.getByText('NOTIF')).toBeInTheDocument()
  })
})
