'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function LogButton({ albumId }: { albumId: string }) {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open(albumId)}
      className="bg-brand-yellow text-ink border-punk border-black shadow-hard-5-red px-6 py-3.5 font-display text-sm"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG / REVIEW
    </button>
  )
}
