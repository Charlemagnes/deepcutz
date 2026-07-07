import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const TONE_CLASSES = {
  light: "bg-[#f2f2f2] text-[#0a0a0a] border-black",
  white: "bg-white text-[#0a0a0a] border-black",
  dark: "bg-[#141414] text-[#f2f2f2] border-[#f2f2f2]",
} as const

const BORDER_CLASSES = {
  2: "border-2",
  3: "border-[3px]",
} as const

const SHADOW_CLASSES: Record<4 | 5 | 6 | 8, Record<Accent, string>> = {
  4: {
    red: "shadow-[4px_4px_0_#ff2b2b]",
    blue: "shadow-[4px_4px_0_#2b6bff]",
    yellow: "shadow-[4px_4px_0_#ffe000]",
    cyan: "shadow-[4px_4px_0_#2ee6ff]",
  },
  5: {
    red: "shadow-[5px_5px_0_#ff2b2b]",
    blue: "shadow-[5px_5px_0_#2b6bff]",
    yellow: "shadow-[5px_5px_0_#ffe000]",
    cyan: "shadow-[5px_5px_0_#2ee6ff]",
  },
  6: {
    red: "shadow-[6px_6px_0_#ff2b2b]",
    blue: "shadow-[6px_6px_0_#2b6bff]",
    yellow: "shadow-[6px_6px_0_#ffe000]",
    cyan: "shadow-[6px_6px_0_#2ee6ff]",
  },
  8: {
    red: "shadow-[8px_8px_0_#ff2b2b]",
    blue: "shadow-[8px_8px_0_#2b6bff]",
    yellow: "shadow-[8px_8px_0_#ffe000]",
    cyan: "shadow-[8px_8px_0_#2ee6ff]",
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
