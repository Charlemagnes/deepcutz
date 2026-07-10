import { cn } from "@/lib/utils"
import type { Accent } from "./types"
import { HARD_SHADOW_CLASSES, PRESS_CLASSES } from "./shadow-classes"

const BORDER_CLASSES = {
  2: "border-2",
  punk: "border-punk",
} as const

type PunkPressButtonProps = {
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  accent?: Accent | "ink"
  size?: 3 | 4 | 5 | 6
  border?: 2 | "punk"
  rotate?: number
  className?: string
  children: React.ReactNode
}

export function PunkPressButton({
  onClick,
  type = "button",
  disabled,
  accent,
  size,
  border = "punk",
  rotate = 0,
  className,
  children,
}: PunkPressButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        BORDER_CLASSES[border],
        accent && size && HARD_SHADOW_CLASSES[size][accent],
        accent && size && PRESS_CLASSES[size],
        className
      )}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </button>
  )
}
