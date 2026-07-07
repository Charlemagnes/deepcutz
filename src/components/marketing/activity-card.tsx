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
      <div className="flex items-center gap-2 font-[family-name:var(--font-space-mono)] text-[11px] text-[#555] mb-2">
        <span
          aria-hidden="true"
          className="w-[18px] h-[18px] rounded-full inline-block"
          style={{ backgroundColor: avatarColor }}
        />
        <b className="text-[#0a0a0a]">{username}</b> · {timestampLabel}
      </div>
      <div className="font-[family-name:var(--font-bungee)] text-[15px]">{albumTitle}</div>
      <div className="font-[family-name:var(--font-space-mono)] text-[11px] text-[#555] my-0.5 mb-2">
        {artist}
      </div>
      <StarRating rating={rating} />
    </HardShadowCard>
  )
}
