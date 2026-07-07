import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const GRADIENTS: Record<Accent, string> = {
  red: "linear-gradient(150deg,var(--color-brand-red),#3a0000)",
  yellow: "linear-gradient(150deg,var(--color-brand-yellow),#7a5c00)",
  blue: "linear-gradient(150deg,var(--color-brand-blue),#001a5c)",
  cyan: "linear-gradient(150deg,var(--color-brand-cyan),#003c47)",
}

const SHADOW_CLASSES: Record<Accent, string> = {
  red: "shadow-hard-5-red",
  blue: "shadow-hard-5-blue",
  yellow: "shadow-hard-5-yellow",
  cyan: "shadow-hard-5-cyan",
}

const OFFSET_CLASSES = {
  up: "-mt-6",
  down: "mt-6",
  none: "",
} as const

export function AlbumSwatch({
  accent,
  shadowAccent,
  offset = "none",
}: {
  accent: Accent
  shadowAccent: Accent
  offset?: keyof typeof OFFSET_CLASSES
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "aspect-square border-punk border-black relative",
        SHADOW_CLASSES[shadowAccent],
        OFFSET_CLASSES[offset]
      )}
      style={{ backgroundImage: GRADIENTS[accent] }}
    >
      <div
        className="absolute inset-0 opacity-40 [mix-blend-mode:multiply]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />
    </div>
  )
}
