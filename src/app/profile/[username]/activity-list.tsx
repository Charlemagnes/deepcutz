import Link from 'next/link'
import { StarRating } from '@/components/marketing/star-rating'
import { AlbumCoverThumb } from '@/components/marketing/album-cover-thumb'
import { formatDate } from '@/lib/format'
import type { AlbumRef } from '@/lib/supabase/normalize'
import { EmptyState } from './empty-state'

export type ActivityItem =
  | {
      kind: 'review'
      id: string
      createdAt: string
      rating: number
      album: AlbumRef
    }
  | {
      kind: 'diary'
      id: string
      createdAt: string
      rating: number | null
      listenedDate: string
      album: AlbumRef
    }

export function ActivityList({ items, emptyMessage }: { items: ActivityItem[]; emptyMessage: string }) {
  if (items.length === 0) return <EmptyState>{emptyMessage}</EmptyState>

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <Link
          key={`${item.kind}-${item.id}`}
          href={`/album/${item.album.id}`}
          className="grid grid-cols-[54px_1fr] gap-3.5 bg-paper border-2 border-black shadow-hard-4-blue p-3 text-ink"
        >
          <AlbumCoverThumb src={item.album.cover_url} sizePx={54} sizes="54px" />
          <div className="min-w-0">
            <div className="font-punk-mono text-10-5 text-ink-600 mb-0.5">
              {item.kind === 'review' ? 'RATED' : 'LOGGED'} · {formatDate(item.createdAt)}
            </div>
            <div className="font-display text-13-5 leading-tight truncate">{item.album.title}</div>
            <div className="text-ink-600 font-punk-mono text-10-5 truncate">{item.album.artist}</div>
            {item.rating != null && (
              <div className="mt-1">
                <StarRating rating={item.rating} size="sm" />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
