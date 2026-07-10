import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Accent } from "./types"
import { HARD_SHADOW_CLASSES, PRESS_CLASSES } from "./shadow-classes"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-display whitespace-nowrap transition-transform hover:scale-105",
  {
    variants: {
      variant: {
        solid: "bg-brand-yellow border-black text-ink",
        ghost: "bg-transparent border-paper text-paper",
        "outline-dark": "bg-ink border-paper text-paper",
      },
      size: {
        sm: "text-xs px-[18px] py-[10px] border-2",
        md: "text-sm px-7 py-[15px] border-punk",
        lg: "text-[15px] px-8 py-4 border-punk",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
)

const SHADOW_CLASSES: Record<"sm" | "md" | "lg", Record<Accent, string>> = {
  sm: {
    red: cn(HARD_SHADOW_CLASSES[3].red, PRESS_CLASSES[3]),
    blue: cn(HARD_SHADOW_CLASSES[3].blue, PRESS_CLASSES[3]),
    yellow: cn(HARD_SHADOW_CLASSES[3].yellow, PRESS_CLASSES[3]),
    cyan: cn(HARD_SHADOW_CLASSES[3].cyan, PRESS_CLASSES[3]),
  },
  md: {
    red: cn(HARD_SHADOW_CLASSES[5].red, PRESS_CLASSES[5]),
    blue: cn(HARD_SHADOW_CLASSES[5].blue, PRESS_CLASSES[5]),
    yellow: cn(HARD_SHADOW_CLASSES[5].yellow, PRESS_CLASSES[5]),
    cyan: cn(HARD_SHADOW_CLASSES[5].cyan, PRESS_CLASSES[5]),
  },
  lg: {
    red: cn(HARD_SHADOW_CLASSES[6].red, PRESS_CLASSES[6]),
    blue: cn(HARD_SHADOW_CLASSES[6].blue, PRESS_CLASSES[6]),
    yellow: cn(HARD_SHADOW_CLASSES[6].yellow, PRESS_CLASSES[6]),
    cyan: cn(HARD_SHADOW_CLASSES[6].cyan, PRESS_CLASSES[6]),
  },
}

type PunkButtonProps = VariantProps<typeof buttonVariants> & {
  href: string
  accent?: Accent
  rotate?: number
  className?: string
  children: React.ReactNode
}

export function PunkButton({
  href,
  variant = "solid",
  size = "md",
  accent,
  rotate = 0,
  className,
  children,
}: PunkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size }),
        accent && SHADOW_CLASSES[size ?? "md"][accent],
        className
      )}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </Link>
  )
}
