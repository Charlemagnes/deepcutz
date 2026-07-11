import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/marketing/star-rating'
import { formatDate } from '@/lib/format'
import type { AlbumRef } from '@/lib/supabase/normalize'
import { EmptyState } from './empty-state'

export type DiaryEntry = {
  id: string
  createdAt: string
  rating: number | null
  listenedDate: string
  album: AlbumRef
}

export function DiaryList({ entries }: { entries: DiaryEntry[] }) {
  if (entries.length === 0) return <EmptyState>No diary entries yet.</EmptyState>

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/album/${entry.album.id}`}
          className="flex items-center gap-3 bg-ink-900 border border-ink-800 px-3 py-2"
        >
          <div className="relative w-8.5 h-8.5 border border-ink-800 bg-ink-800 shrink-0">
            {entry.album.cover_url && <Image src={entry.album.cover_url} alt="" fill sizes="34px" className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-punk-mono font-bold text-11-5 truncate">{entry.album.title}</div>
            <div className="text-ink-500 font-punk-mono text-10 truncate">{entry.album.artist}</div>
          </div>
          {entry.rating != null && <StarRating rating={entry.rating} size="sm" />}
          <div className="font-punk-mono text-10 text-ink-500 shrink-0">{formatDate(entry.listenedDate)}</div>
        </Link>
      ))}
    </div>
  )
}
