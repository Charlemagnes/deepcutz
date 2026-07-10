import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const AVATAR_ACCENT_CLASSES: Record<Accent, string> = {
  red: "bg-brand-red",
  blue: "bg-brand-blue",
  yellow: "bg-brand-yellow",
  cyan: "bg-brand-cyan",
}

const SIZE_TEXT_CLASSES = {
  sm: "text-11",
  md: "text-13",
} as const

type AttributionLineProps = {
  username: string | null
  href?: string
  timestampLabel: string
  accent?: Accent | { customColor: string }
  avatar?: boolean
  size?: "sm" | "md"
  className?: string
  fallbackLabel?: string
}

export function AttributionLine({
  username,
  href,
  timestampLabel,
  accent,
  avatar = true,
  size = "sm",
  className,
  fallbackLabel = "someone",
}: AttributionLineProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-punk-mono text-ink-600 mb-1.5",
        SIZE_TEXT_CLASSES[size],
        className
      )}
    >
      {avatar && (
        <span
          className={cn(
            "w-4.5 h-4.5 rounded-full border border-black shrink-0",
            accent && typeof accent === "string" && AVATAR_ACCENT_CLASSES[accent]
          )}
          style={accent && typeof accent === "object" ? { backgroundColor: accent.customColor } : undefined}
        />
      )}
      {username && href ? (
        <Link href={href} className="hover:underline">
          <b className="text-ink">{username}</b>
        </Link>
      ) : (
        <b className="text-ink">{username ?? fallbackLabel}</b>
      )}
      <span className="text-ink-500">{timestampLabel}</span>
    </div>
  )
}
