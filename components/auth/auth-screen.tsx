'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

const inputClass =
  'mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary'

export function AuthScreen() {
  const { signInWithPassword, signUpWithPassword, mode } = useAuth()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    try {
      if (tab === 'signin') {
        const { error } = await signInWithPassword(email, password)
        if (error) setError(error)
      } else {
        const { error, needsEmailConfirm } = await signUpWithPassword(email, password)
        if (error) {
          setError(error)
        } else if (needsEmailConfirm) {
          setInfo('Check your email to confirm your account, then come back and sign in.')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col justify-between bg-background px-6 py-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">FunctionFNDR</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-foreground">
          {tab === 'signin' ? 'Welcome back.' : 'Find the function.'}
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
          {tab === 'signin'
            ? 'Sign in to your campus account to see tonight\u2019s map.'
            : 'Create your campus account. .edu verification happens next.'}
        </p>

        {mode === 'guest' && (
          <div className="mt-5 rounded-2xl border border-border bg-card/70 p-3 text-[11px] text-muted-foreground">
            Supabase env vars aren&rsquo;t set, so the app is in guest preview mode. Sign-in is disabled until
            <span className="font-semibold text-foreground"> NEXT_PUBLIC_SUPABASE_URL</span> and
            <span className="font-semibold text-foreground"> NEXT_PUBLIC_SUPABASE_ANON_KEY</span> are configured.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoCapitalize="none"
            className={inputClass}
            placeholder="you@school.edu"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            className={inputClass}
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        {info && <p className="text-xs font-semibold text-primary">{info}</p>}

        <button
          type="submit"
          disabled={submitting || mode === 'guest'}
          className="mt-1 w-full rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Working\u2026' : tab === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => {
            setTab(tab === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
          className="w-full text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          {tab === 'signin' ? 'New here? Create an account.' : 'Already have an account? Sign in.'}
        </button>
      </form>

      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        By continuing you agree to the campus code of conduct.
      </p>
    </div>
  )
}
