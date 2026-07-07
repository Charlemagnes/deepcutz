'use client'

import { useLoggingModal } from '@/components/logging/logging-modal-provider'

export function LogButton({ albumId }: { albumId: string }) {
  const { open } = useLoggingModal()

  return (
    <button
      type="button"
      onClick={() => open(albumId)}
      className="bg-[#ffe000] text-[#0a0a0a] border-[3px] border-black shadow-[5px_5px_0_#ff2b2b] px-6 py-3.5 font-[family-name:var(--font-bungee)] text-sm"
      style={{ rotate: '-1deg' }}
    >
      ▶ LOG / REVIEW
    </button>
  )
}
