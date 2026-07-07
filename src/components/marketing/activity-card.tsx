import { HardShadowCard } from "./hard-shadow-card"
import { StarRating } from "./star-rating"
import type { Accent } from "./types"

type ActivityCardProps = {
  username: string
  timestampLabel: string
  albumTitle: string
  artist: string
  rating: number
  accent: Accent
  avatarColor: string
}

export function ActivityCard({
  username,
  timestampLabel,
  albumTitle,
  artist,
  rating,
  accent,
  avatarColor,
}: ActivityCardProps) {
  return (
    <HardShadowCard tone="light" accent={accent} border={2} shadow={5} className="p-4">
      <div className="flex items-center gap-2 font-punk-mono text-[11px] text-ink-600 mb-2">
        <span
          aria-hidden="true"
          className="w-4.5 h-4.5 rounded-full inline-block"
          style={{ backgroundColor: avatarColor }}
        />
        <b className="text-ink">{username}</b> · {timestampLabel}
      </div>
      <div className="font-display text-[15px]">{albumTitle}</div>
      <div className="font-punk-mono text-[11px] text-ink-600 my-0.5 mb-2">
        {artist}
      </div>
      <StarRating rating={rating} />
    </HardShadowCard>
  )
}
