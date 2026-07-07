const TOKEN_URL = 'https://accounts.spotify.com/api/token'

/** Refresh this much before actual expiry, so a cached token never gets used mid-flight. */
const EXPIRY_BUFFER_MS = 60_000

interface CachedToken {
  accessToken: string
  expiresAt: number
}

let cachedToken: CachedToken | null = null
let pendingTokenRequest: Promise<string> | null = null

export async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.accessToken
  if (pendingTokenRequest) return pendingTokenRequest

  pendingTokenRequest = fetchNewToken().finally(() => {
    pendingTokenRequest = null
  })
  return pendingTokenRequest
}

async function fetchNewToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured (SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET)')
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_BUFFER_MS,
  }
  return cachedToken.accessToken
}

/** Test-only escape hatch to reset module-level state between test cases. */
export function __resetTokenCacheForTests(): void {
  cachedToken = null
  pendingTokenRequest = null
}
