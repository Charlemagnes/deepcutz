const SIZES = {
  md: { fontSize: 24, svgWidth: 18, svgHeight: 24 },
  sm: { fontSize: 18, svgHeight: 19, svgWidth: 14 },
} as const

export function Wordmark({ size = "md" }: { size?: keyof typeof SIZES }) {
  const { fontSize, svgWidth, svgHeight } = SIZES[size]

  return (
    <div
      className="font-display text-white inline-flex items-center whitespace-nowrap"
      style={{
        fontSize,
        textShadow: "3px 3px 0 var(--color-brand-red), -1px -1px 0 var(--color-brand-blue)",
        transform: "rotate(-2deg)",
      }}
    >
      DEEP
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 20 28"
        className="mx-0.5"
        aria-hidden="true"
      >
        <polygon
          points="13,0 2,15 9,15 6,28 18,11 10,11"
          style={{ fill: "var(--color-brand-yellow)" }}
          stroke="#000"
          strokeWidth={1.5}
        />
      </svg>
      CUTZ
    </div>
  )
}
