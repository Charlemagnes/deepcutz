'use client'

import { useState, useTransition } from 'react'
import { listComments, type CommentWithAuthor } from '@/lib/comments/actions'
import { CommentForm } from './comment-form'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function CommentSection({ reviewId, initialCount }: { reviewId: string; initialCount: number }) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<CommentWithAuthor[] | null>(null)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    if (!expanded && comments === null) {
      startTransition(async () => {
        const result = await listComments(reviewId)
        setComments(result)
      })
    }
    setExpanded((prev) => !prev)
  }

  function handleAdded(comment: CommentWithAuthor) {
    setComments((prev) => (prev ? [...prev, comment] : [comment]))
    setCount((prev) => prev + 1)
  }

  return (
    <div className="font-[family-name:var(--font-space-mono)]">
      <button type="button" onClick={handleToggle} className="text-[11px] text-[#555] hover:text-[#0a0a0a]">
        💬 {count}
      </button>

      {expanded && (
        <div className="mt-2.5 flex flex-col gap-2.5">
          {isPending && comments === null && <p className="text-[11px] text-[#888] m-0">Loading comments…</p>}

          {comments && comments.length === 0 && <p className="text-[11px] text-[#888] m-0">No comments yet.</p>}

          {comments && comments.length > 0 && (
            <div className="flex flex-col gap-2">
              {comments.map((comment) => (
                <div key={comment.id} className="border-t-2 border-black pt-2">
                  <div className="flex items-center gap-2 text-[10.5px] text-[#555] mb-1">
                    <b className="text-[#0a0a0a]">{comment.username ?? 'unknown'}</b>
                    <span className="text-[#999]">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="m-0 text-[12px] leading-normal whitespace-pre-wrap text-[#0a0a0a]">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          <CommentForm reviewId={reviewId} onAdded={handleAdded} />
        </div>
      )}
    </div>
  )
}
