'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CommentWithAuthor } from '@/lib/comments/actions'
import { CommentForm } from './comment-form'
import { AttributionLine } from '@/components/marketing/attribution-line'
import { formatDate } from '@/lib/format'

export function ReplyThread({
  reviewId,
  initialComments,
}: {
  reviewId: string
  initialComments: CommentWithAuthor[]
}) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)

  const byId = new Map(comments.map((comment) => [comment.id, comment]))

  function handleAdded(comment: CommentWithAuthor) {
    setComments((prev) => [...prev, comment])
    setReplyingToId(null)
  }

  return (
    <div className="font-punk-mono flex flex-col gap-4">
      <CommentForm reviewId={reviewId} placeholder="Post a reply…" onAdded={handleAdded} />

      {comments.length === 0 ? (
        <p className="text-xs text-ink-500 m-0">No replies yet — be the first.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const parent = comment.parentCommentId ? byId.get(comment.parentCommentId) : null
            return (
              <div key={comment.id} className="bg-paper border-2 border-black shadow-hard-3-blue p-3 text-ink">
                <AttributionLine
                  username={comment.username}
                  href={comment.username ? `/profile/${comment.username}` : undefined}
                  timestampLabel={formatDate(comment.createdAt)}
                  avatar={false}
                  fallbackLabel="unknown"
                  className="mb-1"
                />

                {parent && (
                  <p className="m-0 mb-1 text-10-5 text-ink-500">
                    Replying to{' '}
                    {parent.username ? (
                      <Link href={`/profile/${parent.username}`} className="hover:underline">
                        @{parent.username}
                      </Link>
                    ) : (
                      '@unknown'
                    )}
                  </p>
                )}

                <p className="m-0 text-13 leading-normal whitespace-pre-wrap">{comment.content}</p>

                <button
                  type="button"
                  onClick={() => setReplyingToId((prev) => (prev === comment.id ? null : comment.id))}
                  className="mt-2 text-11 text-ink-500 hover:text-ink"
                >
                  Reply
                </button>

                {replyingToId === comment.id && (
                  <div className="mt-2">
                    <CommentForm
                      reviewId={reviewId}
                      parentCommentId={comment.id}
                      placeholder={comment.username ? `Reply to @${comment.username}…` : 'Post a reply…'}
                      autoFocus
                      onAdded={handleAdded}
                      onCancel={() => setReplyingToId(null)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
