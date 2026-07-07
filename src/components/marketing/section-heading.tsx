import type { Accent } from "./types"

const ACCENT_STYLES: Record<Accent, { text: string; shadow: string }> = {
  yellow: { text: "#ffe000", shadow: "#2b6bff" },
  cyan: { text: "#2ee6ff", shadow: "#ff2b2b" },
  blue: { text: "#2b6bff", shadow: "#ffe000" },
  red: { text: "#ff2b2b", shadow: "#2b6bff" },
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
  const colors = accent ? ACCENT_STYLES[accent] : { text: "#0a0a0a", shadow: null }

  return (
    <Tag
      className="font-[family-name:var(--font-bungee)] inline-block m-0"
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
