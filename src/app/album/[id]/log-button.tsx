'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'
import { PunkPressButton } from '@/components/marketing/punk-press-button'

export function LogButton({ albumId }: { albumId: string }) {
  const { open } = useLoggingModal()

  return (
    <PunkPressButton
      onClick={() => open(albumId)}
      accent="yellow"
      size={3}
      border="punk"
      rotate={-1}
      className="bg-paper text-ink border-black flex items-center gap-2.5 px-5 py-3 font-punk-mono text-xs transition-transform hover:scale-105"
    >
      ▶ LOG / REVIEW
    </PunkPressButton>
  )
}
