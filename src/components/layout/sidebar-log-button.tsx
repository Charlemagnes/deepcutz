'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function SidebarLogButton() {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open()}
      className="mt-auto bg-brand-yellow text-ink border-punk border-black shadow-hard-5-red px-3 py-3.5 font-display text-13 transition-transform hover:scale-105 active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG A LISTEN
    </button>
  )
}
