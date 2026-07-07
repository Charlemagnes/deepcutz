import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'
import { __resetTokenCacheForTests, getAccessToken } from './auth'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const originalEnv = { ...process.env }

describe('getAccessToken', () => {
  beforeEach(() => {
    __resetTokenCacheForTests()
    process.env.SPOTIFY_CLIENT_ID = 'test-client-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('fetches and returns a token', async () => {
    server.use(
      http.post(TOKEN_URL, () => HttpResponse.json({ access_token: 'token-1', expires_in: 3600 })),
    )

    await expect(getAccessToken()).resolves.toBe('token-1')
  })

  it('reuses the cached token before expiry', async () => {
    const tokenHandler = vi.fn(() =>
      HttpResponse.json({ access_token: 'token-1', expires_in: 3600 }),
    )
    server.use(http.post(TOKEN_URL, tokenHandler))

    await getAccessToken()
    await getAccessToken()

    expect(tokenHandler).toHaveBeenCalledTimes(1)
  })

  it('de-dupes concurrent calls into a single token request', async () => {
    const tokenHandler = vi.fn(() =>
      HttpResponse.json({ access_token: 'token-1', expires_in: 3600 }),
    )
    server.use(http.post(TOKEN_URL, tokenHandler))

    const [a, b] = await Promise.all([getAccessToken(), getAccessToken()])

    expect(a).toBe('token-1')
    expect(b).toBe('token-1')
    expect(tokenHandler).toHaveBeenCalledTimes(1)
  })

  it('throws when credentials are not configured', async () => {
    delete process.env.SPOTIFY_CLIENT_ID
    delete process.env.SPOTIFY_CLIENT_SECRET

    await expect(getAccessToken()).rejects.toThrow(/not configured/)
  })

  it('throws on a non-ok token response', async () => {
    server.use(
      http.post(TOKEN_URL, () => HttpResponse.json({ error: 'invalid_client' }, { status: 400 })),
    )

    await expect(getAccessToken()).rejects.toThrow(/Spotify token request failed/)
  })
})
