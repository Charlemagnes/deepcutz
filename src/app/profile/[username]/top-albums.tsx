import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/marketing/star-rating'
import type { AlbumRef } from '@/lib/supabase/normalize'
import { EmptyState } from './empty-state'

export type TopAlbum = { id: string; rating: number; album: AlbumRef }

export function TopAlbums({ albums }: { albums: TopAlbum[] }) {
  if (albums.length === 0) return <EmptyState>No rated albums yet.</EmptyState>

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5">
      {albums.map(({ id, rating, album }) => (
        <Link key={id} href={`/album/${album.id}`} className="group">
          <div className="relative aspect-square border-2 border-black shadow-hard-3-red bg-ink-800">
            {album.cover_url && <Image src={album.cover_url} alt="" fill sizes="120px" className="object-cover" />}
          </div>
          <div className="font-punk-mono text-10-5 font-bold mt-1.5 truncate">{album.title}</div>
          <StarRating rating={rating} size="sm" />
        </Link>
      ))}
    </div>
  )
}
