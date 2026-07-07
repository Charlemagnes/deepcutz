export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div
        className="font-display text-2xl mb-3"
        style={{ color: 'var(--color-brand-yellow)', textShadow: '3px 3px 0 var(--color-brand-red)', rotate: '-1deg' }}
      >
        NOTIFICATIONS
      </div>
      <p className="font-punk-mono text-sm text-ink-500 max-w-sm">
        Coming soon — this is where you&apos;ll see new followers, likes, and comments.
      </p>
    </div>
  )
}
