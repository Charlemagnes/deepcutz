import { cn } from "@/lib/utils"

const SIZES = {
  sm: 12,
  md: 14,
} as const

export function StarRating({
  rating,
  size = "md",
  className = "",
}: {
  rating: number
  size?: keyof typeof SIZES
  className?: string
}) {
  const filled = Math.floor(rating)

  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("inline-flex", className)}
      style={{
        fontSize: SIZES[size],
        letterSpacing: 1,
        textShadow: "1px 1px 0 var(--color-ink)",
      }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" style={{ color: i < filled ? "var(--color-brand-yellow)" : "var(--color-ink-200)" }}>
          ★
        </span>
      ))}
    </div>
  )
}
