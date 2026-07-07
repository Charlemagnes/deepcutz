'use client'

import { useState } from 'react'

const SIZES = { sm: 15, md: 30 } as const

/** idx is the 0-based star index; clicking the left half of a star sets idx+0.5, the right half sets idx+1. */
export function valueFromPointer(e: { currentTarget: HTMLElement; clientX: number }, idx: number): number {
  const rect = e.currentTarget.getBoundingClientRect()
  const frac = rect.width === 0 ? 1 : (e.clientX - rect.left) / rect.width
  return idx + (frac <= 0.5 ? 0.5 : 1)
}

export function StarRatingInput({
  value,
  onChange,
  size = 'md',
  label,
}: {
  value: number
  onChange: (value: number) => void
  size?: keyof typeof SIZES
  label: string
}) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  const px = SIZES[size]

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(Math.min(5, (value || 0) + 0.5))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(Math.max(0.5, (value || 0) - 0.5))
    }
  }

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={0.5}
      aria-valuemax={5}
      aria-valuenow={value || undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="inline-flex items-center gap-0.5 outline-none"
      onMouseLeave={() => setHover(0)}
    >
      {[0, 1, 2, 3, 4].map((idx) => {
        const fill = Math.max(0, Math.min(1, active - idx)) * 100
        return (
          <span
            key={idx}
            data-testid={`star-${idx}`}
            onMouseMove={(e) => setHover(valueFromPointer(e, idx))}
            onClick={(e) => onChange(valueFromPointer(e, idx))}
            className="relative inline-block cursor-pointer leading-none"
            style={{
              width: px,
              height: px,
              fontSize: px,
              color: 'var(--color-ink-200)',
              textShadow: '1.5px 1.5px 0 #000',
            }}
          >
            ★
            <span
              className="absolute inset-0 overflow-hidden whitespace-nowrap"
              style={{ width: `${fill}%`, color: 'var(--color-brand-yellow)', textShadow: '1.5px 1.5px 0 #000' }}
            >
              ★
            </span>
          </span>
        )
      })}
    </div>
  )
}
