import { HardShadowCard } from "./hard-shadow-card"
import { StarRating } from "./star-rating"
import type { Accent } from "./types"

const GRADIENTS: Record<Accent, string> = {
  red: "linear-gradient(150deg,var(--color-brand-red),#3a0000)",
  yellow: "linear-gradient(150deg,var(--color-brand-yellow),#7a5c00)",
  blue: "linear-gradient(150deg,var(--color-brand-blue),#001a5c)",
  cyan: "linear-gradient(150deg,var(--color-brand-cyan),#003c47)",
}

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
        <div className="font-punk-mono text-[10px] text-ink-600 mb-0.5 uppercase">
          {username} · {timestampLabel}
        </div>
        <div className="font-display text-[13px]">{albumTitle}</div>
        <StarRating rating={rating} size="sm" />
      </div>
    </HardShadowCard>
  )
}
