'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to deepcutz</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a username to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
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
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and underscores only.
            </p>
          </div>

          {error && (
            <p id="onboarding-error" className="text-sm text-destructive">{error}</p>
          )}

          <Button id="onboarding-submit" type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}
