'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function LogButton({ albumId }: { albumId: string }) {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open(albumId)}
      className="bg-paper text-ink border-punk flex items-center gap-2.5 border-2 border-black shadow-hard-3-yellow px-5 py-3 font-punk-mono text-xs transition-transform hover:scale-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG / REVIEW
    </button>
  )
}
