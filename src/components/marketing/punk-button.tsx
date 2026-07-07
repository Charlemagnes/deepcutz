import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-display whitespace-nowrap transition-transform",
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
    red: "shadow-hard-3-red active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    blue: "shadow-hard-3-blue active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    yellow: "shadow-hard-3-yellow active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    cyan: "shadow-hard-3-cyan active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  },
  md: {
    red: "shadow-hard-5-red active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    blue: "shadow-hard-5-blue active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    yellow: "shadow-hard-5-yellow active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    cyan: "shadow-hard-5-cyan active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  },
  lg: {
    red: "shadow-hard-6-red active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    blue: "shadow-hard-6-blue active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    yellow: "shadow-hard-6-yellow active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    cyan: "shadow-hard-6-cyan active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
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
