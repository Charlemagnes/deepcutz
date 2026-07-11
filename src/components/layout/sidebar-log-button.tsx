'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'
import { PunkPressButton } from '@/components/marketing/punk-press-button'

export function SidebarLogButton() {
  const { open } = useLoggingModal()

  return (
    <PunkPressButton
      onClick={() => open()}
      accent="red"
      size={5}
      border="punk"
      rotate={-1}
      className="mt-auto bg-brand-yellow text-black border-black px-3 py-3.5 font-display text-13 transition-transform hover:scale-105"
    >
      ▶ LOG A LISTEN
    </PunkPressButton>
  )
}
