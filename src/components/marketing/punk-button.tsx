import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-[family-name:var(--font-bungee)] whitespace-nowrap transition-transform",
  {
    variants: {
      variant: {
        solid: "bg-[#ffe000] border-black text-[#0a0a0a]",
        ghost: "bg-transparent border-[#f2f2f2] text-[#f2f2f2]",
        "outline-dark": "bg-[#0a0a0a] border-[#f2f2f2] text-[#f2f2f2]",
      },
      size: {
        sm: "text-xs px-[18px] py-[10px] border-2",
        md: "text-sm px-7 py-[15px] border-[3px]",
        lg: "text-[15px] px-8 py-4 border-[3px]",
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
    red: "shadow-[3px_3px_0_#ff2b2b] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    blue: "shadow-[3px_3px_0_#2b6bff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    yellow: "shadow-[3px_3px_0_#ffe000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
    cyan: "shadow-[3px_3px_0_#2ee6ff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  },
  md: {
    red: "shadow-[5px_5px_0_#ff2b2b] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    blue: "shadow-[5px_5px_0_#2b6bff] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    yellow: "shadow-[5px_5px_0_#ffe000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
    cyan: "shadow-[5px_5px_0_#2ee6ff] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  },
  lg: {
    red: "shadow-[6px_6px_0_#ff2b2b] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    blue: "shadow-[6px_6px_0_#2b6bff] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    yellow: "shadow-[6px_6px_0_#ffe000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
    cyan: "shadow-[6px_6px_0_#2ee6ff] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
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
