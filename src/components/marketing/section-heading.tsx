import type { Accent } from "./types"

const ACCENT_STYLES: Record<Accent, { text: string; shadow: string }> = {
  yellow: { text: "var(--color-brand-yellow)", shadow: "var(--color-brand-blue)" },
  cyan: { text: "var(--color-brand-cyan)", shadow: "var(--color-brand-red)" },
  blue: { text: "var(--color-brand-blue)", shadow: "var(--color-brand-yellow)" },
  red: { text: "var(--color-brand-red)", shadow: "var(--color-brand-blue)" },
}

const SIZES = {
  md: 30,
  lg: 38,
} as const

type SectionHeadingProps = {
  children: React.ReactNode
  accent?: Accent
  rotate?: number
  size?: keyof typeof SIZES
  as?: "h2" | "h3"
}

export function SectionHeading({
  children,
  accent,
  rotate = -1,
  size = "md",
  as: Tag = "h2",
}: SectionHeadingProps) {
  const colors = accent ? ACCENT_STYLES[accent] : { text: "var(--color-ink)", shadow: null }

  return (
    <Tag
      className="font-display inline-block m-0"
      style={{
        fontSize: SIZES[size],
        color: colors.text,
        textShadow: colors.shadow ? `3px 3px 0 ${colors.shadow}` : undefined,
        rotate: `${rotate}deg`,
      }}
    >
      {children}
    </Tag>
  )
}
