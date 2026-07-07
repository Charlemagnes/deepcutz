import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const TONE_CLASSES = {
  light: "bg-paper text-ink border-black",
  white: "bg-white text-ink border-black",
  dark: "bg-ink-900 text-paper border-paper",
} as const

const BORDER_CLASSES = {
  2: "border-2",
  3: "border-punk",
} as const

const SHADOW_CLASSES: Record<4 | 5 | 6 | 8, Record<Accent, string>> = {
  4: {
    red: "shadow-hard-4-red",
    blue: "shadow-hard-4-blue",
    yellow: "shadow-hard-4-yellow",
    cyan: "shadow-hard-4-cyan",
  },
  5: {
    red: "shadow-hard-5-red",
    blue: "shadow-hard-5-blue",
    yellow: "shadow-hard-5-yellow",
    cyan: "shadow-hard-5-cyan",
  },
  6: {
    red: "shadow-hard-6-red",
    blue: "shadow-hard-6-blue",
    yellow: "shadow-hard-6-yellow",
    cyan: "shadow-hard-6-cyan",
  },
  8: {
    red: "shadow-hard-8-red",
    blue: "shadow-hard-8-blue",
    yellow: "shadow-hard-8-yellow",
    cyan: "shadow-hard-8-cyan",
  },
}

type HardShadowCardProps = {
  tone?: keyof typeof TONE_CLASSES
  accent: Accent
  border?: keyof typeof BORDER_CLASSES
  shadow?: 4 | 5 | 6 | 8
  rotate?: number
  className?: string
  children: React.ReactNode
}

export function HardShadowCard({
  tone = "light",
  accent,
  border = 3,
  shadow = 6,
  rotate = 0,
  className,
  children,
}: HardShadowCardProps) {
  return (
    <div
      className={cn(
        TONE_CLASSES[tone],
        BORDER_CLASSES[border],
        SHADOW_CLASSES[shadow][accent],
        "border-solid",
        className
      )}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </div>
  )
}
