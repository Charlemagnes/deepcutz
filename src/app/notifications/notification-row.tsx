import Link from 'next/link'
import { HardShadowCard } from '@/components/marketing/hard-shadow-card'
import type { NotificationItem } from '@/lib/notifications/actions'

function describe(item: NotificationItem): { text: string; href: string } {
  const actorName = item.actor.username ?? 'someone'

  switch (item.type) {
    case 'follow':
      return {
        text: `${actorName} started following you.`,
        href: `/profile/${item.actor.username ?? ''}`,
      }
    case 'like':
      return {
        text: `${actorName} liked your review of ${item.review?.albumTitle ?? 'an album'}.`,
        href: item.review ? `/album/${item.review.albumId}#review-${item.review.id}` : '#',
      }
    case 'comment':
      return {
        text: `${actorName} commented on your review of ${item.review?.albumTitle ?? 'an album'}.`,
        href: item.review ? `/album/${item.review.albumId}#review-${item.review.id}` : '#',
      }
  }
}

export function NotificationRow({ item }: { item: NotificationItem }) {
  const { text, href } = describe(item)

  return (
    <Link href={href} className="block">
      <HardShadowCard
        accent={item.isUnread ? 'red' : 'cyan'}
        border={2}
        shadow={4}
        className={`p-3.5 flex items-center gap-3 ${item.isUnread ? 'border-l-4 border-l-brand-red' : ''}`}
      >
        {item.isUnread && (
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-brand-red"
            data-testid="unread-dot"
          />
        )}
        <p className="m-0 text-[13px] leading-snug text-ink font-punk-mono">{text}</p>
      </HardShadowCard>
    </Link>
  )
}
