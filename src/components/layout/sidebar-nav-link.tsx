'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const CHIP_STYLES = {
  light: { background: 'var(--color-paper)', color: 'var(--color-ink)' },
  yellow: { background: 'var(--color-brand-yellow)', color: 'var(--color-ink)' },
  red: { background: 'var(--color-brand-red)', color: '#fff' },
  blue: { background: 'var(--color-brand-blue)', color: '#fff' },
} as const

export function SidebarNavLink({
  href,
  label,
  accent,
  rotate,
  badge,
}: {
  href: string
  label: string
  accent: keyof typeof CHIP_STYLES
  rotate: number
  badge?: ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  const { background, color } = CHIP_STYLES[accent]

  return (
    <Link
      href={href}
      className="flex items-center font-display text-[13px] px-3 py-2.5 border-punk border-black transition-transform hover:scale-105"
      style={{
        background,
        color,
        rotate: `${rotate}deg`,
        boxShadow: isActive ? '5px 5px 0 #000' : '4px 4px 0 #000',
      }}
    >
      {label}
      {badge !== undefined && <span className="ml-auto">{badge}</span>}
    </Link>
  )
}
