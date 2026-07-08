'use client'

import { useState, useTransition } from 'react'
import { addComment, type CommentWithAuthor } from '@/lib/comments/actions'

export function CommentForm({
  reviewId,
  parentCommentId = null,
  placeholder = 'Say something…',
  autoFocus = false,
  onAdded,
  onCancel,
}: {
  reviewId: string
  parentCommentId?: string | null
  placeholder?: string
  autoFocus?: boolean
  onAdded: (comment: CommentWithAuthor) => void
  onCancel?: () => void
}) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const disabled = isPending || content.trim().length === 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled) return

    startTransition(async () => {
      const result = await addComment(reviewId, content.trim(), parentCommentId)
      onAdded(result)
      setContent('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={2}
        autoFocus={autoFocus}
        className="w-full resize-none bg-paper border-2 border-black px-2.5 py-2 text-[12.5px] font-punk-mono text-ink placeholder:text-ink-500 outline-none"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-display text-[10px] px-3 py-1.5 border-2 border-black bg-paper text-ink"
          >
            CANCEL
          </button>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="font-display text-[10px] px-3 py-1.5 border-2 border-black bg-brand-yellow text-ink disabled:opacity-50"
        >
          {isPending ? 'POSTING…' : 'POST'}
        </button>
      </div>
    </form>
  )
}
