import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { HomeFeed } from './home-feed'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: vi.fn(),
}))
vi.mock('./home-search-trigger', () => ({
  HomeSearchTrigger: () => null,
}))

const VIEWER_ID = 'viewer-1'

type Row = Record<string, unknown>

/** Chainable Supabase query-builder stand-in. Every builder method returns `this`;
 *  awaiting/`.then`-ing it resolves to whatever `resolve(table, calls)` decides,
 *  based on the table name and the method calls made on the chain so far. */
function mockSupabase(resolve: (table: string, calls: { method: string; args: unknown[] }[]) => { data: Row[] | Row | null; count?: number }) {
  function builder(table: string) {
    const calls: { method: string; args: unknown[] }[] = []
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'eq', 'neq', 'in', 'order', 'limit', 'maybeSingle', 'single']
    for (const m of methods) {
      chain[m] = (...args: unknown[]) => {
        calls.push({ method: m, args })
        return chain
      }
    }
    chain.then = (onFulfilled: (v: unknown) => unknown) => {
      const result = resolve(table, calls)
      return Promise.resolve(result).then(onFulfilled)
    }
    return chain
  }
  return { from: vi.fn((table: string) => builder(table)) }
}

function album(id: string) {
  return { id, title: `Album ${id}`, artist: `Artist ${id}`, cover_url: null }
}

function profile(username: string) {
  return { username, avatar_url: null }
}

function review(id: string, profileId: string, opts: { albumId?: string; createdAt?: string } = {}) {
  return {
    id,
    rating: 4,
    content: 'great record',
    is_spoiler: false,
    created_at: opts.createdAt ?? '2026-07-01T00:00:00.000Z',
    like_count: 0,
    comment_count: 0,
    profile_id: profileId,
    profiles: profile(profileId),
    albums: album(opts.albumId ?? `${id}-album`),
  }
}

beforeEach(() => {
  vi.mocked(getCurrentUser).mockResolvedValue({ id: VIEWER_ID } as never)
})

describe('HomeFeed', () => {
  it('shows the full empty-state panel when the viewer has no reviews and follows nobody', async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase((table) => {
        if (table === 'follows') return { data: [] }
        if (table === 'profiles') return { data: [] }
        if (table === 'reviews') return { data: [] }
        if (table === 'diary_entries') return { data: [] }
        if (table === 'likes') return { data: [] }
        return { data: [] }
      }) as never,
    )

    render(await HomeFeed())

    expect(screen.getByText('YOUR FEED IS EMPTY')).toBeInTheDocument()
    expect(screen.queryByText(/not following anyone yet/i)).not.toBeInTheDocument()
  })

  it('shows own reviews plus a follow-nudge banner when the viewer has reviews but follows nobody', async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase((table, calls) => {
        if (table === 'follows') return { data: [] }
        if (table === 'profiles') return { data: [{ id: 'someone-else', username: 'someone-else', avatar_url: null }] }
        if (table === 'reviews') {
          const isCountQuery = calls.some((c) => c.method === 'select' && (c.args[1] as { head?: boolean } | undefined)?.head)
          if (isCountQuery) return { data: null, count: 0 }
          return { data: [review('r1', VIEWER_ID)] }
        }
        if (table === 'diary_entries') return { data: [] }
        if (table === 'likes') return { data: [] }
        return { data: [] }
      }) as never,
    )

    render(await HomeFeed())

    expect(screen.queryByText('YOUR FEED IS EMPTY')).not.toBeInTheDocument()
    expect(screen.getByText(/not following anyone yet/i)).toBeInTheDocument()
    expect(screen.getByText('Album r1-album')).toBeInTheDocument()
  })

  it('merges own reviews with followed users’ reviews, most recent first, with no banner', async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase((table, calls) => {
        if (table === 'follows') return { data: [{ following_id: 'friend-1' }] }
        if (table === 'profiles') return { data: [] }
        if (table === 'reviews') {
          const isCountQuery = calls.some((c) => c.method === 'select' && (c.args[1] as { head?: boolean } | undefined)?.head)
          if (isCountQuery) return { data: null, count: 0 }
          return {
            data: [
              review('own-review', VIEWER_ID, { createdAt: '2026-07-01T00:00:00.000Z' }),
              review('friend-review', 'friend-1', { createdAt: '2026-07-02T00:00:00.000Z' }),
            ],
          }
        }
        if (table === 'diary_entries') return { data: [] }
        if (table === 'likes') return { data: [] }
        return { data: [] }
      }) as never,
    )

    render(await HomeFeed())

    expect(screen.queryByText('YOUR FEED IS EMPTY')).not.toBeInTheDocument()
    expect(screen.queryByText(/not following anyone yet/i)).not.toBeInTheDocument()
    const titles = screen.getAllByText(/^Album /).map((el) => el.textContent)
    expect(titles).toEqual(['Album friend-review-album', 'Album own-review-album'])
  })
})
