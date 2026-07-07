'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function SidebarLogButton() {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open()}
      className="mt-auto bg-brand-yellow text-ink border-punk border-black shadow-hard-5-red px-3 py-3.5 font-display text-[13px]"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG A LISTEN
    </button>
  )
}
