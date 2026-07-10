import { cn } from "@/lib/utils"
import type { Accent } from "./types"
import { HARD_SHADOW_CLASSES } from "./shadow-classes"

const TONE_CLASSES = {
  light: "bg-paper text-ink border-black",
  white: "bg-white text-ink border-black",
  dark: "bg-ink-900 text-paper border-paper",
} as const

const BORDER_CLASSES = {
  2: "border-2",
  3: "border-punk",
} as const

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
        HARD_SHADOW_CLASSES[shadow][accent],
        "border-solid",
        className
      )}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </div>
  )
}
