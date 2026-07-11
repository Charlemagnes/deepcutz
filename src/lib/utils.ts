import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Registers the project's custom `--text-*` font-size scale and `-punk`
// border-width utilities (globals.css) so tailwind-merge doesn't mistake
// them for color utilities and drop a real `text-{color}`/`border-{color}`
// class as a false conflict.
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["9", "10", "10-5", "11", "11-5", "12-5", "13", "13-5", "14-5", "15", "28", "38"] },
      ],
      "border-w": [{ border: ["punk"] }],
      "border-w-t": [{ "border-t": ["punk"] }],
      "border-w-b": [{ "border-b": ["punk"] }],
      "border-w-l": [{ "border-l": ["punk"] }],
      "border-w-r": [{ "border-r": ["punk"] }],
      "border-w-y": [{ "border-y": ["punk"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
