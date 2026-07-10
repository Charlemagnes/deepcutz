import { HardShadowCard } from "./hard-shadow-card"
import { StarRating } from "./star-rating"
import type { Accent } from "./types"
import { GRADIENTS } from "./gradients"

type MiniFeedRowProps = {
  username: string
  timestampLabel: string
  albumTitle: string
  rating: number
  thumbnailAccent: Accent
  shadowAccent: Accent
}

export function MiniFeedRow({
  username,
  timestampLabel,
  albumTitle,
  rating,
  thumbnailAccent,
  shadowAccent,
}: MiniFeedRowProps) {
  return (
    <HardShadowCard
      tone="light"
      accent={shadowAccent}
      border={2}
      shadow={4}
      className="grid grid-cols-[64px_1fr] gap-3 p-2.5"
    >
      <div
        aria-hidden="true"
        className="w-16 h-16 border-2 border-black"
        style={{ backgroundImage: GRADIENTS[thumbnailAccent] }}
      />
      <div>
        <div className="font-punk-mono text-10 text-ink-600 mb-0.5 uppercase">
          {username} · {timestampLabel}
        </div>
        <div className="font-display text-13">{albumTitle}</div>
        <StarRating rating={rating} size="sm" />
      </div>
    </HardShadowCard>
  )
}
