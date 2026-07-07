export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div
        className="font-[family-name:var(--font-bungee)] text-2xl mb-3"
        style={{ color: '#ffe000', textShadow: '3px 3px 0 #ff2b2b', rotate: '-1deg' }}
      >
        NOTIFICATIONS
      </div>
      <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#9a9a9a] max-w-sm">
        Coming soon — this is where you&apos;ll see new followers, likes, and comments.
      </p>
    </div>
  )
}
