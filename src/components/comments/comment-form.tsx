'use client'

import { useState, useTransition } from 'react'
import { addComment, type CommentWithAuthor } from '@/lib/comments/actions'

export function CommentForm({
  reviewId,
  onAdded,
}: {
  reviewId: string
  onAdded: (comment: CommentWithAuthor) => void
}) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const disabled = isPending || content.trim().length === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return

    startTransition(async () => {
      const result = await addComment(reviewId, content.trim())
      onAdded(result)
      setContent('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Say something…"
        rows={2}
        className="w-full resize-none bg-[#f2f2f2] border-2 border-black px-2.5 py-2 text-[12.5px] font-[family-name:var(--font-space-mono)] text-[#0a0a0a] placeholder:text-[#888] outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className="self-end font-[family-name:var(--font-bungee)] text-[10px] px-3 py-1.5 border-2 border-black bg-[#ffe000] text-[#0a0a0a] disabled:opacity-50"
      >
        {isPending ? 'POSTING…' : 'POST'}
      </button>
    </form>
  )
}
