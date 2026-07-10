import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

type PunkInputProps = React.ComponentProps<typeof InputPrimitive> & { error?: boolean }

export function PunkInput({ className, error, ...props }: PunkInputProps) {
  return (
    <InputPrimitive
      aria-invalid={error || undefined}
      className={cn(
        "bg-ink-900 border-punk border-black px-3.25 py-3 text-paper text-13-5 font-punk-mono placeholder:text-ink-600 focus:outline-none",
        error && "border-brand-red",
        className
      )}
      {...props}
    />
  )
}
