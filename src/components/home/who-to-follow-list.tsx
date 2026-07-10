import Link from 'next/link'
import { FollowButton } from './follow-button'

export type FollowSuggestion = {
  id: string
  username: string | null
  reviewCount: number
}

/** Presentational "who to follow" list, shared between the persistent home-feed
 *  sidebar and the inline suggestions shown on the empty-feed panel. Data-fetching
 *  (suggestions + per-suggestion review counts) stays in home-feed.tsx. */
export function WhoToFollowList({
  suggestions,
  variant = 'sidebar',
}: {
  suggestions: FollowSuggestion[]
  variant?: 'sidebar' | 'panel'
}) {
  if (suggestions.length === 0) return null

  return (
    <div>
      <div
        className="font-display text-sm mb-3.5 w-fit"
        style={{ color: 'var(--color-brand-yellow)', textShadow: '2px 2px 0 var(--color-brand-red)', rotate: '-1deg' }}
      >
        WHO 2 FOLLOW
      </div>
      <div className={variant === 'panel' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md' : 'flex flex-col gap-3.5'}>
        {suggestions.map((profile) => (
          <div key={profile.id} className="flex items-center gap-2.5">
            <span className="w-7.5 h-7.5 bg-brand-red border-2 border-black shrink-0" />
            <div className="flex-1 leading-tight min-w-0">
              {profile.username ? (
                <Link href={`/profile/${profile.username}`} className="block font-punk-mono font-bold text-11-5 text-paper truncate hover:underline">
                  {profile.username}
                </Link>
              ) : (
                <div className="font-punk-mono font-bold text-11-5 text-paper truncate">listener</div>
              )}
              <div className="text-ink-500 font-punk-mono text-10">{profile.reviewCount} reviews</div>
            </div>
            <FollowButton profileId={profile.id} initialIsFollowing={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
