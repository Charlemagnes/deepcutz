import { cn } from "@/lib/utils"
import type { Accent } from "./types"
import { GRADIENTS } from "./gradients"

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
