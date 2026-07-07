'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const CHIP_STYLES = {
  light: { background: '#f2f2f2', color: '#0a0a0a' },
  yellow: { background: '#ffe000', color: '#0a0a0a' },
  red: { background: '#ff2b2b', color: '#fff' },
  blue: { background: '#2b6bff', color: '#fff' },
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
      className="flex items-center font-[family-name:var(--font-bungee)] text-[13px] px-3 py-2.5 border-[3px] border-black"
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
