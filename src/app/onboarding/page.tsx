'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wordmark } from '@/components/marketing/wordmark'
import { PunkInput } from '@/components/marketing/punk-input'
import { InlineBanner } from '@/components/marketing/inline-banner'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const trimmed = username.trim().toLowerCase()

    // Basic validation
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters.')
      setLoading(false)
      return
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setError('Username can only contain lowercase letters, numbers, and underscores.')
      setLoading(false)
      return
    }

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .maybeSingle()

    if (existing) {
      setError('That username is already taken.')
      setLoading(false)
      return
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expired. Please sign in again.')
      setLoading(false)
      return
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: trimmed })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-8 py-12 font-body text-paper">
      <div className="w-full max-w-[380px] flex flex-col items-center gap-[22px]">
        <Wordmark />

        <div className="text-center">
          <div className="font-anton text-28 tracking-wide text-white">CHOOSE YOUR HANDLE</div>
          <div className="text-13 text-ink-500 mt-1.5">
            One last thing before you start logging.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[22px]">
          <label className="flex flex-col gap-[7px]">
            <span className="font-punk-mono text-11 tracking-wide text-ink-500">USERNAME</span>
            <PunkInput
              id="username"
              type="text"
              placeholder="coolcat42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              autoFocus
            />
            <p className="font-punk-mono text-11 text-ink-600">
              Lowercase letters, numbers, and underscores only.
            </p>
          </label>

          {error && (
            <InlineBanner id="onboarding-error" tone="error">
              {error}
            </InlineBanner>
          )}

          <button
            id="onboarding-submit"
            type="submit"
            disabled={loading}
            className="-rotate-[0.6deg] bg-brand-yellow text-ink border-punk border-black py-[14px] font-display text-15 tracking-wide cursor-pointer shadow-hard-5-red disabled:opacity-60"
          >
            {loading ? 'SAVING…' : '▶ CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  )
}
