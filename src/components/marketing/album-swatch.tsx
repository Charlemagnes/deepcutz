import { cn } from "@/lib/utils"
import type { Accent } from "./types"

const GRADIENTS: Record<Accent, string> = {
  red: "linear-gradient(150deg,#ff2b2b,#3a0000)",
  yellow: "linear-gradient(150deg,#ffe000,#7a5c00)",
  blue: "linear-gradient(150deg,#2b6bff,#001a5c)",
  cyan: "linear-gradient(150deg,#2ee6ff,#003c47)",
}

const SHADOW_CLASSES: Record<Accent, string> = {
  red: "shadow-[5px_5px_0_#ff2b2b]",
  blue: "shadow-[5px_5px_0_#2b6bff]",
  yellow: "shadow-[5px_5px_0_#ffe000]",
  cyan: "shadow-[5px_5px_0_#2ee6ff]",
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
        "aspect-square border-[3px] border-black relative",
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
