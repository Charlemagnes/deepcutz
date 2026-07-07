'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function SidebarLogButton() {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open()}
      className="mt-auto bg-[#ffe000] text-[#0a0a0a] border-[3px] border-black shadow-[5px_5px_0_#ff2b2b] px-3 py-3.5 font-[family-name:var(--font-bungee)] text-[13px]"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG A LISTEN
    </button>
  )
}
