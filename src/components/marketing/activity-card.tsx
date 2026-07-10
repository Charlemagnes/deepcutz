import { HardShadowCard } from "./hard-shadow-card"
import { StarRating } from "./star-rating"
import { AttributionLine } from "./attribution-line"
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
      <AttributionLine
        username={username}
        timestampLabel={`· ${timestampLabel}`}
        accent={{ customColor: avatarColor }}
        className="mb-2"
      />
      <div className="font-display text-15">{albumTitle}</div>
      <div className="font-punk-mono text-11 text-ink-600 my-0.5 mb-2">
        {artist}
      </div>
      <StarRating rating={rating} />
    </HardShadowCard>
  )
}
