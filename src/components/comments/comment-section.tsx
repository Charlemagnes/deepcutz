'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { listComments, type CommentWithAuthor } from '@/lib/comments/actions'
import { CommentForm } from './comment-form'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function CommentSection({ reviewId, initialCount }: { reviewId: string; initialCount: number }) {
  const [expanded, setExpanded] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [comments, setComments] = useState<CommentWithAuthor[] | null>(null)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function ensureLoaded() {
    if (comments === null) {
      startTransition(async () => {
        const result = await listComments(reviewId)
        setComments(result)
      })
    }
  }

  function handleToggleList() {
    ensureLoaded()
    setExpanded((prev) => !prev)
  }

  function handleToggleReply() {
    ensureLoaded()
    setComposerOpen((prev) => !prev)
  }

  function handleAdded(comment: CommentWithAuthor) {
    setComments((prev) => (prev ? [...prev, comment] : [comment]))
    setCount((prev) => prev + 1)
    setExpanded(true)
    setComposerOpen(false)
  }

  const topLevelComments = (comments ?? []).filter((comment) => comment.parentCommentId === null)

  return (
    <div className="font-punk-mono">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleReply}
          className="flex items-center gap-1.5 text-[13px] font-display px-2.5 py-1.5 border-2 border-black bg-paper text-ink shadow-hard-3-red"
        >
          💬 REPLY
        </button>

        <button type="button" onClick={handleToggleList} className="text-[11px] text-ink-600 hover:text-ink">
          {count}
        </button>

        <Link href={`/review/${reviewId}`} className="text-[11px] text-ink-500 hover:text-ink hover:underline">
          View thread
        </Link>
      </div>

      {composerOpen && (
        <div className="mt-2.5">
          <CommentForm reviewId={reviewId} onAdded={handleAdded} onCancel={() => setComposerOpen(false)} autoFocus />
        </div>
      )}

      {expanded && (
        <div className="mt-2.5 flex flex-col gap-2.5">
          {isPending && comments === null && <p className="text-[11px] text-ink-500 m-0">Loading comments…</p>}

          {comments && topLevelComments.length === 0 && (
            <p className="text-[11px] text-ink-500 m-0">No replies yet.</p>
          )}

          {topLevelComments.length > 0 && (
            <div className="flex flex-col gap-2">
              {topLevelComments.map((comment) => (
                <div key={comment.id} className="border-t-2 border-black pt-2">
                  <div className="flex items-center gap-2 text-[10.5px] text-ink-600 mb-1">
                    {comment.username ? (
                      <Link href={`/profile/${comment.username}`} className="hover:underline">
                        <b className="text-ink">{comment.username}</b>
                      </Link>
                    ) : (
                      <b className="text-ink">unknown</b>
                    )}
                    <span className="text-ink-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="m-0 text-[12px] leading-normal whitespace-pre-wrap text-ink">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
