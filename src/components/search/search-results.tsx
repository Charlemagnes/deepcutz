'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { AlbumSearchResult } from '@/lib/spotify/types'
import type { ProfileSearchResult } from '@/lib/profiles/actions'
import type { SearchMode } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

const VARIANTS = {
  compact: {
    wrapper: 'max-h-90 space-y-2 overflow-y-auto',
    list: 'space-y-2',
    message: 'font-punk-mono text-xs text-paper/70',
    link: 'flex items-center gap-3 border-2 border-black bg-paper p-2 transition-transform hover:-translate-y-0.5',
    albumShadow: 'shadow-hard-3-yellow',
    peopleShadow: 'shadow-hard-3-cyan',
    thumb: 'relative h-10 w-10 shrink-0 overflow-hidden border-2 border-black bg-ink',
    thumbSizes: '40px',
    avatar: 'h-9 w-9 shrink-0 rounded-full border-2 border-black object-cover',
    avatarFallback:
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-black bg-brand-yellow font-display text-ink',
    title: 'truncate font-body font-bold text-sm text-ink',
    subtitle: 'truncate font-punk-mono text-xs text-ink/70',
  },
  full: {
    wrapper: 'space-y-3',
    list: 'space-y-3',
    message: 'font-punk-mono text-sm text-paper/70',
    link: 'flex items-center gap-4 border-2 border-black bg-paper p-3 transition-transform hover:-translate-y-0.5',
    albumShadow: 'shadow-hard-4-yellow',
    peopleShadow: 'shadow-hard-4-cyan',
    thumb: 'relative h-14 w-14 shrink-0 overflow-hidden border-2 border-black bg-ink',
    thumbSizes: '56px',
    avatar: 'h-12 w-12 shrink-0 rounded-full border-2 border-black object-cover',
    avatarFallback:
      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black bg-brand-yellow font-display text-ink',
    title: 'truncate font-body font-bold text-ink',
    subtitle: 'truncate font-punk-mono text-sm text-ink/70',
  },
} as const

export function SearchResults({
  variant,
  mode,
  albumResults,
  peopleResults,
  loading,
  trimmedQuery,
  showEmptyPrompt,
  showNoResults,
  onSelect,
}: {
  variant: keyof typeof VARIANTS
  mode: SearchMode
  albumResults: AlbumSearchResult[]
  peopleResults: ProfileSearchResult[]
  loading: boolean
  trimmedQuery: string
  showEmptyPrompt: boolean
  showNoResults: boolean
  onSelect?: () => void
}) {
  const v = VARIANTS[variant]
  const rotate = variant === 'full' ? (index: number) => ({ rotate: index % 2 === 0 ? '-0.5deg' : '0.5deg' }) : undefined

  return (
    <div className={v.wrapper}>
      {showEmptyPrompt && <p className={v.message}>Search for an album or a person.</p>}

      {!showEmptyPrompt && loading && <p className={v.message}>Searching…</p>}

      {showNoResults && <p className={v.message}>No matches for &lsquo;{trimmedQuery}&rsquo;.</p>}

      {!showEmptyPrompt && !loading && mode === 'albums' && albumResults.length > 0 && (
        <ul className={v.list}>
          {albumResults.map((album, index) => (
            <li key={album.id}>
              <Link
                href={`/album/${album.id}`}
                onClick={onSelect}
                className={cn(v.link, v.albumShadow)}
                style={rotate?.(index)}
              >
                <div className={v.thumb}>
                  {album.coverUrl ? (
                    <Image src={album.coverUrl} alt={`${album.title} cover art`} fill sizes={v.thumbSizes} className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className={v.title}>{album.title}</p>
                  <p className={v.subtitle}>{album.artist}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!showEmptyPrompt && !loading && mode === 'people' && peopleResults.length > 0 && (
        <ul className={v.list}>
          {peopleResults.map((profile, index) => (
            <li key={profile.id}>
              <Link
                href={`/profile/${profile.username ?? ''}`}
                onClick={onSelect}
                className={cn(v.link, v.peopleShadow)}
                style={rotate?.(index)}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar source domain isn't guaranteed to be allowlisted, unlike album covers
                  <img src={profile.avatar_url} alt="" className={v.avatar} />
                ) : (
                  <div className={v.avatarFallback}>{(profile.username ?? '?')[0]?.toUpperCase() ?? '?'}</div>
                )}
                <p className={v.title}>{profile.username ?? 'Unknown'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
