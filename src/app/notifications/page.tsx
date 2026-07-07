import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listNotifications, markAllNotificationsRead } from '@/lib/notifications/actions'
import { SectionHeading } from '@/components/marketing/section-heading'
import { NotificationRow } from './notification-row'

export default async function NotificationsPage() {
  const user = await getCurrentUser()

  // Middleware already gates this route to authenticated users, but stay
  // defensive rather than assuming that always holds.
  if (!user) {
    redirect('/login')
  }

  // Capture the unread state for this render first...
  const items = await listNotifications()
  // ...then clear it, so the badge drops on the *next* navigation rather than
  // hiding the "new" styling on the list the user is currently looking at.
  await markAllNotificationsRead()

  return (
    <div className="max-w-160 mx-auto px-6 sm:px-9 py-9 text-paper">
      <div className="mb-7">
        <SectionHeading accent="yellow" size="lg">
          NOTIFICATIONS
        </SectionHeading>
      </div>

      {items.length === 0 ? (
        <p className="font-punk-mono text-sm text-ink-500 max-w-sm">
          No notifications yet — go follow some people, like a review, or write one worth
          commenting on.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
