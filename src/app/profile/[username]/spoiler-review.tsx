'use client'

import { useState } from 'react'

/** Review body text, collapsed behind a reveal toggle when the author flagged it as a spoiler. */
export function SpoilerReview({ content }: { content: string }) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <p className="m-0 text-12-5 leading-normal text-ink-800 whitespace-pre-wrap">{content}</p>
    )
  }

  return (
    <div className="relative">
      <p
        aria-hidden="true"
        className="m-0 text-12-5 leading-normal text-ink-800 whitespace-pre-wrap blur-sm select-none pointer-events-none"
      >
        {content}
      </p>
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="absolute inset-0 flex items-center justify-center font-punk-mono text-10 font-bold bg-paper/80 border-2 border-black"
      >
        ⚠ SPOILER — SHOW ANYWAY
      </button>
    </div>
  )
}
