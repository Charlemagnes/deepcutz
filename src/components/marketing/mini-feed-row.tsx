import { HardShadowCard } from "./hard-shadow-card"
import { StarRating } from "./star-rating"
import type { Accent } from "./types"

const GRADIENTS: Record<Accent, string> = {
  red: "linear-gradient(150deg,#ff2b2b,#3a0000)",
  yellow: "linear-gradient(150deg,#ffe000,#7a5c00)",
  blue: "linear-gradient(150deg,#2b6bff,#001a5c)",
  cyan: "linear-gradient(150deg,#2ee6ff,#003c47)",
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
        <div className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#666] mb-0.5 uppercase">
          {username} · {timestampLabel}
        </div>
        <div className="font-[family-name:var(--font-bungee)] text-[13px]">{albumTitle}</div>
        <StarRating rating={rating} size="sm" />
      </div>
    </HardShadowCard>
  )
}
