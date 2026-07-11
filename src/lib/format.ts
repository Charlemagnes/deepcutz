export function formatDate(iso: string, options?: { includeYear?: boolean }) {
  const includeYear = options?.includeYear ?? true
  return new Date(iso).toLocaleDateString('en-US', {
    year: includeYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  })
}

export function relativeTime(iso: string) {
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}w ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
