import type { Accent } from "./types"

export const HARD_SHADOW_CLASSES: Record<3 | 4 | 5 | 6 | 7 | 8 | 9, Record<Accent | "ink", string>> = {
  3: {
    red: "shadow-hard-3-red",
    blue: "shadow-hard-3-blue",
    yellow: "shadow-hard-3-yellow",
    cyan: "shadow-hard-3-cyan",
    ink: "shadow-hard-3-ink",
  },
  4: {
    red: "shadow-hard-4-red",
    blue: "shadow-hard-4-blue",
    yellow: "shadow-hard-4-yellow",
    cyan: "shadow-hard-4-cyan",
    ink: "shadow-hard-4-ink",
  },
  5: {
    red: "shadow-hard-5-red",
    blue: "shadow-hard-5-blue",
    yellow: "shadow-hard-5-yellow",
    cyan: "shadow-hard-5-cyan",
    ink: "shadow-hard-5-ink",
  },
  6: {
    red: "shadow-hard-6-red",
    blue: "shadow-hard-6-blue",
    yellow: "shadow-hard-6-yellow",
    cyan: "shadow-hard-6-cyan",
    ink: "shadow-hard-6-ink",
  },
  7: {
    red: "shadow-hard-7-red",
    blue: "shadow-hard-7-blue",
    yellow: "shadow-hard-7-yellow",
    cyan: "shadow-hard-7-cyan",
    ink: "shadow-hard-7-ink",
  },
  8: {
    red: "shadow-hard-8-red",
    blue: "shadow-hard-8-blue",
    yellow: "shadow-hard-8-yellow",
    cyan: "shadow-hard-8-cyan",
    ink: "shadow-hard-8-ink",
  },
  9: {
    red: "shadow-hard-9-red",
    blue: "shadow-hard-9-blue",
    yellow: "shadow-hard-9-yellow",
    cyan: "shadow-hard-9-cyan",
    ink: "shadow-hard-9-ink",
  },
}

export const PRESS_CLASSES: Record<3 | 4 | 5 | 6, string> = {
  3: "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
  4: "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
  5: "active:translate-x-[5px] active:translate-y-[5px] active:shadow-none",
  6: "active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
}
