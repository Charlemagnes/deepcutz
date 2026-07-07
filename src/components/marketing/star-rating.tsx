const SIZES = {
  sm: 12,
  md: 14,
} as const

export function StarRating({
  rating,
  size = "md",
}: {
  rating: number
  size?: keyof typeof SIZES
}) {
  const filled = Math.floor(rating)

  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className="inline-flex"
      style={{
        fontSize: SIZES[size],
        letterSpacing: 1,
        textShadow: "1px 1px 0 #000",
      }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" style={{ color: i < filled ? "#ffe000" : "#d8d8d8" }}>
          ★
        </span>
      ))}
    </div>
  )
}
