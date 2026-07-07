import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getAlbumDetails } from '@/lib/spotify/actions'
import { LogButton } from './log-button'
import { ReviewItem } from './review-item'

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [album, supabase] = await Promise.all([getAlbumDetails(id), createClient()])

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="bg-paper border-punk border-black shadow-hard-7-red px-8 py-7 text-center"
          style={{ rotate: '-1deg' }}
        >
          <div className="font-display text-2xl text-ink mb-2">
            ALBUM NOT FOUND
          </div>
          <p className="font-punk-mono text-sm text-ink-600 m-0">
            We couldn&apos;t find this record on Spotify. It may have been removed.
          </p>
        </div>
      </div>
    )
  }

  const [{ data: cachedAlbum }, { data: reviews }] = await Promise.all([
    supabase.from('albums').select('avg_rating, rating_count').eq('id', id).maybeSingle(),
    supabase
      .from('reviews')
      .select('id, rating, content, is_spoiler, created_at, profiles(username, avatar_url)')
      .eq('album_id', id)
      .order('created_at', { ascending: false })
      .limit(15),
  ])

  const reviewList = reviews ?? []
  const year = album.releaseDate ? album.releaseDate.slice(0, 4) : null

  return (
    <div className="min-h-screen px-6 sm:px-9 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-7 mb-10">
        <div
          className="relative w-55 h-55 border-punk border-black shadow-hard-7-red bg-ink-800 shrink-0"
          style={{ rotate: '-1deg' }}
        >
          {album.coverUrl && (
            <Image src={album.coverUrl} alt={`${album.title} cover art`} fill sizes="220px" className="object-cover" />
          )}
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <h1
            className="font-display text-3xl sm:text-4xl text-paper leading-tight break-words"
            style={{ textShadow: '3px 3px 0 var(--color-brand-blue)' }}
          >
            {album.title}
          </h1>
          <p className="font-punk-mono text-sm text-ink-500 mt-2 mb-5">
            {album.artist}
            {year ? ` · ${year}` : ''}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            {cachedAlbum ? (
              <div
                className="bg-paper border-2 border-black shadow-hard-4-yellow px-3.5 py-2.5 font-punk-mono text-ink text-sm"
                style={{ rotate: '1deg' }}
              >
                <b>{cachedAlbum.avg_rating.toFixed(1)}</b> avg ·{' '}
                {cachedAlbum.rating_count} {cachedAlbum.rating_count === 1 ? 'rating' : 'ratings'}
              </div>
            ) : (
              <p className="font-punk-mono text-sm text-ink-500 m-0">
                Be the first to log this album.
              </p>
            )}

            <LogButton albumId={album.id} />
          </div>
        </div>
      </div>

      <div>
        <div
          className="font-display text-xl w-fit mb-4"
          style={{ color: 'var(--color-brand-yellow)', textShadow: '2.5px 2.5px 0 var(--color-brand-red)', rotate: '-1deg' }}
        >
          REVIEWS
        </div>

        {reviewList.length === 0 ? (
          <p className="font-punk-mono text-sm text-ink-500">
            No reviews yet — be the first to log a listen.
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-160">
            {reviewList.map((review) => {
              const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
              return (
                <ReviewItem
                  key={review.id}
                  username={profile?.username ?? 'someone'}
                  rating={review.rating}
                  content={review.content}
                  isSpoiler={review.is_spoiler}
                  createdAt={review.created_at}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
