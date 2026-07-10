'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wordmark } from '@/components/marketing/wordmark'
import { cn } from '@/lib/utils'
import { PunkInput } from '@/components/marketing/punk-input'
import { InlineBanner } from '@/components/marketing/inline-banner'

type Tab = 'sign-in' | 'sign-up'

const COLLAGE_TILES = [
  { from: 'var(--color-brand-red)', to: '#7a0000', rotate: -3 },
  { from: 'var(--color-brand-blue)', to: '#001a5c', rotate: 0 },
  { from: 'var(--color-brand-yellow)', to: '#7a5c00', rotate: 2 },
  { from: 'var(--color-brand-cyan)', to: '#003c47', rotate: 0 },
  { from: 'var(--color-brand-red)', to: '#3a0000', rotate: 0 },
  { from: 'var(--color-brand-yellow)', to: '#4a3800', rotate: -2 },
  { from: 'var(--color-brand-blue)', to: '#000f2e', rotate: 0 },
  { from: 'var(--color-brand-red)', to: '#4a0000', rotate: 3 },
  { from: 'var(--color-brand-yellow)', to: '#5c4600', rotate: 0 },
  { from: 'var(--color-brand-cyan)', to: '#00303a', rotate: -2 },
  { from: 'var(--color-brand-blue)', to: '#001433', rotate: 0 },
  { from: 'var(--color-brand-red)', to: '#5c0000', rotate: 2 },
  { from: 'var(--color-brand-yellow)', to: '#3a2c00', rotate: 0 },
  { from: 'var(--color-brand-cyan)', to: '#002229', rotate: -3 },
  { from: 'var(--color-brand-blue)', to: '#00194a', rotate: 0 },
  { from: 'var(--color-brand-red)', to: '#330000', rotate: 3 },
]

interface AuthFormProps {
  initialTab?: Tab
}

export function AuthForm({ initialTab = 'sign-in' }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isSignUp = activeTab === 'sign-up'

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    setError(null)
    setMessage(null)
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    if (activeTab === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    }

    setLoading(false)
  }

  async function handleGoogleAuth() {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (

    <div className="min-h-screen bg-ink">
          <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.15fr_480px] font-body text-paper">
      {/* Left panel: decorative album-art collage */}
      <div className="hidden lg:block relative overflow-hidden bg-ink border-r-punk border-black">
        <div className="absolute inset-0 grid grid-cols-4 gap-1.5 p-1.5">
          {COLLAGE_TILES.map((tile, i) => (
            <div
              key={i}
              style={{
                background: `linear-gradient(150deg, ${tile.from}, ${tile.to})`,
                transform: tile.rotate ? `rotate(${tile.rotate}deg)` : undefined,
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,.55) 0%, rgba(10,10,10,.35) 40%, rgba(10,10,10,.95) 100%)',
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-between p-11">
          <Wordmark />
          <div className="max-w-[440px]">
            <div className="font-display text-38 leading-[1.15] text-brand-yellow inline-block -rotate-1 [text-shadow:3px_3px_0_var(--color-brand-red)]">
              RATE.
              <br />
              REVIEW.
              <br />
              REPEAT.
            </div>
            <p className="font-punk-mono text-13 leading-relaxed text-ink-200 max-w-[360px] mt-4 bg-black/40 border-l-punk border-brand-yellow px-3 py-2">
              Log every album you spin, follow the ears you trust, and find your next deep cut before
              anyone else does.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex items-center justify-center px-8 py-12">
        <form onSubmit={handleEmailAuth} className="w-full max-w-[380px] flex flex-col gap-[22px]">
          <div className="flex gap-3">
            <button
              id="tab-sign-in"
              type="button"
              onClick={() => switchTab('sign-in')}
              className={cn(
                'flex-1 border-punk border-black py-[10px] font-display text-xs tracking-wide cursor-pointer transition-transform hover:scale-105',
                !isSignUp
                  ? '-rotate-1 bg-brand-yellow text-ink shadow-hard-3-red'
                  : 'bg-ink-900 text-ink-500 shadow-hard-3-blue',
              )}
            >
              LOG IN
            </button>
            <button
              id="tab-sign-up"
              type="button"
              onClick={() => switchTab('sign-up')}
              className={cn(
                'flex-1 border-punk border-black py-[10px] font-display text-xs tracking-wide cursor-pointer transition-transform hover:scale-105',
                isSignUp
                  ? 'rotate-1 bg-brand-yellow text-ink shadow-hard-3-cyan'
                  : 'bg-ink-900 text-ink-500 shadow-hard-3-blue',
              )}
            >
              SIGN UP
            </button>
          </div>

          <div>
            <div className="font-anton text-28 tracking-wide text-white">
              {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </div>
            <div className="text-13 text-ink-500 mt-1.5">
              {isSignUp
                ? 'Join to start logging your own listens.'
                : 'Log in to see what your friends are spinning.'}
            </div>
          </div>

          <label className="flex flex-col gap-[7px]">
            <span className="font-punk-mono text-11 tracking-wide text-ink-500">EMAIL</span>
            <PunkInput
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-[7px]">
            <span className="font-punk-mono text-11 tracking-wide text-ink-500">PASSWORD</span>
            <div className="relative flex items-center">
              <PunkInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="flex-1 box-border pl-3.25 pr-13.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-[9px] bg-ink border border-ink-600 text-ink-500 font-display text-9 tracking-wide cursor-pointer px-[7px] py-[5px] transition-transform hover:scale-105"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </label>

          {isSignUp && (
            <label className="flex flex-col gap-[7px]">
              <span className="font-punk-mono text-11 tracking-wide text-ink-500">
                CONFIRM PASSWORD
              </span>
              <PunkInput
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="box-border shadow-hard-3-cyan"
              />
            </label>
          )}

          {error && (
            <InlineBanner id="auth-error" tone="error">
              {error}
            </InlineBanner>
          )}
          {message && (
            <InlineBanner id="auth-message" tone="success">
              {message}
            </InlineBanner>
          )}

          <button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="rotate-[-0.6deg] bg-brand-yellow text-ink border-punk border-black py-[14px] font-display text-15 tracking-wide cursor-pointer shadow-hard-5-red transition-transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? 'LOADING…' : isSignUp ? '＋ CREATE ACCOUNT' : '▶ LOG IN'}
          </button>

          <div className="text-center text-13 text-ink-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                switchTab(isSignUp ? 'sign-in' : 'sign-up')
              }}
              className="text-brand-yellow font-bold no-underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </a>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-ink-600" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-ink px-2 font-punk-mono text-10 tracking-wide text-ink-500 uppercase">
                Or continue with
              </span>
            </div>
          </div>

          <button
            id="google-auth"
            type="button"
            onClick={handleGoogleAuth}
            className="flex items-center justify-center gap-2 bg-ink border-punk border-paper text-paper py-3 font-display text-xs tracking-wide cursor-pointer transition-transform hover:scale-105"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            GOOGLE
          </button>
        </form>
      </div>
    </div>
    </div>

  )
}
