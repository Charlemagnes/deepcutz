'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SidebarNavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-full px-4 py-3 text-lg transition-colors hover:bg-accent',
        isActive && 'font-bold',
      )}
    >
      {icon}
      {label}
    </Link>
  )
}
