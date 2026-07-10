import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  error: "border-red-400/35 bg-red-400/[.08] text-red-300",
  success: "border-emerald-400/35 bg-emerald-400/[.08] text-emerald-300",
} as const

type InlineBannerProps = {
  tone: "error" | "success"
  children: React.ReactNode
  id?: string
}

export function InlineBanner({ tone, children, id }: InlineBannerProps) {
  return (
    <div
      id={id}
      className={cn(
        "font-punk-mono text-xs px-3 py-2.5 rounded-lg border",
        TONE_CLASSES[tone]
      )}
    >
      {children}
    </div>
  )
}
