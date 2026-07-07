import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { StarRating } from '@/components/marketing/star-rating'
import { FollowButton } from './follow-button'

export async function HomeFeed() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  const [{ data: reviews }, { data: candidates }, { data: newTapes }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, content, created_at, profiles(username, avatar_url), albums(id, title, artist, cover_url)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user!.id),
    supabase
      .from('albums')
      .select('id, title, artist, cover_url')
      .order('cached_at', { ascending: false })
      .limit(3),
  ])

  const followingIds = new Set((candidates ?? []).map((f) => f.following_id))
  const { data: suggestions } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .neq('id', user!.id)
    .order('created_at', { ascending: false })
    .limit(8)

  const whoToFollow = (suggestions ?? []).filter((p) => !followingIds.has(p.id)).slice(0, 3)
  const reviewCounts = await Promise.all(
    whoToFollow.map((p) => supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('profile_id', p.id)),
  )

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-[1fr_300px]">
      <main className="overflow-hidden">
        <div className="sticky top-0 z-10 px-6 sm:px-9 pt-6 pb-3.5 bg-[#0a0a0a]">
          <div
            className="font-[family-name:var(--font-bungee)] text-2xl w-fit"
            style={{ color: '#ffe000', textShadow: '3px 3px 0 #ff2b2b', rotate: '-1deg' }}
          >
            FRESH TAPES
          </div>
        </div>

        <div className="px-6 sm:px-9 pb-9 flex flex-col gap-5">
          {(reviews ?? []).length === 0 && (
            <p className="font-[family-name:var(--font-space-mono)] text-sm text-[#9a9a9a]">
              No reviews yet — be the first to log a listen.
            </p>
          )}
          {(reviews ?? []).map((review) => {
            const album = Array.isArray(review.albums) ? review.albums[0] : review.albums
            const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles
            if (!album || !profile) return null

            return (
              <Link
                key={review.id}
                href={`/album/${album.id}`}
                className="grid grid-cols-[126px_1fr] gap-4.5 bg-[#f2f2f2] border-[3px] border-black shadow-[6px_6px_0_#2b6bff] p-3.5 text-[#0a0a0a]"
              >
                <div className="relative w-[126px] h-[126px] border-2 border-black bg-[#333] shrink-0">
                  {album.cover_url && (
                    <Image src={album.cover_url} alt="" fill sizes="126px" className="object-cover" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 font-[family-name:var(--font-space-mono)] text-[11px] text-[#555] mb-1.5">
                    <span className="w-[18px] h-[18px] rounded-full bg-[#2b6bff] border border-black" />
                    <b className="text-[#0a0a0a]">{profile.username ?? 'someone'}</b>
                  </div>
                  <div className="font-[family-name:var(--font-bungee)] text-lg leading-none">{album.title}</div>
                  <div className="text-[#555] font-[family-name:var(--font-space-mono)] text-[11px] my-1">
                    {album.artist}
                  </div>
                  <div className="mb-2">
                    <StarRating rating={review.rating} />
                  </div>
                  {review.content && (
                    <p className="m-0 text-[12.5px] leading-[1.5] text-[#1a1a1a] max-w-[420px] line-clamp-2">
                      {review.content}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <aside className="border-l-[3px] border-[#f2f2f2] px-4 py-5.5 hidden xl:flex flex-col gap-6.5">
        <Link
          href="/search"
          className="flex items-center gap-2.5 bg-[#f2f2f2] text-[#0a0a0a] border-2 border-black shadow-[3px_3px_0_#ffe000] px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-xs"
        >
          <span>⌕</span> SEARCH ALBUMS, PEOPLE…
        </Link>

        {whoToFollow.length > 0 && (
          <div>
            <div
              className="font-[family-name:var(--font-bungee)] text-sm mb-3.5 w-fit"
              style={{ color: '#ffe000', textShadow: '2px 2px 0 #ff2b2b', rotate: '-1deg' }}
            >
              WHO 2 FOLLOW
            </div>
            <div className="flex flex-col gap-3.5">
              {whoToFollow.map((profile, i) => (
                <div key={profile.id} className="flex items-center gap-2.5">
                  <span className="w-[30px] h-[30px] bg-[#ff2b2b] border-2 border-black shrink-0" />
                  <div className="flex-1 leading-tight min-w-0">
                    <div className="font-[family-name:var(--font-space-mono)] font-bold text-[11.5px] truncate">
                      {profile.username ?? 'listener'}
                    </div>
                    <div className="text-[#8a8a8a] font-[family-name:var(--font-space-mono)] text-[10px]">
                      {reviewCounts[i]?.count ?? 0} reviews
                    </div>
                  </div>
                  <FollowButton profileId={profile.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {(newTapes ?? []).length > 0 && (
          <div>
            <div
              className="font-[family-name:var(--font-bungee)] text-sm mb-3.5 w-fit"
              style={{ color: '#ffe000', textShadow: '2px 2px 0 #2b6bff', rotate: '1deg' }}
            >
              NEW TAPES
            </div>
            <div className="flex flex-col gap-2.5">
              {(newTapes ?? []).map((album) => (
                <Link key={album.id} href={`/album/${album.id}`} className="flex items-center gap-2.5">
                  <span className="relative w-[38px] h-[38px] bg-[#333] border-2 border-black shrink-0">
                    {album.cover_url && (
                      <Image src={album.cover_url} alt="" fill sizes="38px" className="object-cover" />
                    )}
                  </span>
                  <div className="leading-tight min-w-0">
                    <div className="font-[family-name:var(--font-space-mono)] font-bold text-[12.5px] truncate">
                      {album.title}
                    </div>
                    <div className="text-[#8a8a8a] font-[family-name:var(--font-space-mono)] text-[11px] truncate">
                      {album.artist}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
