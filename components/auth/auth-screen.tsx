'use client'

import { useState } from 'react'
import { GraduationCap, Loader2, Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { isEduEmail } from '@/lib/auth/profile-service'
import { cn } from '@/lib/utils'

type Mode = 'sign-in' | 'sign-up'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Enter your .edu email and password.')
      return
    }

    if (mode === 'sign-up' && !isEduEmail(trimmedEmail)) {
      setError('Use your official student email ending in .edu.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const result = mode === 'sign-up'
      ? await signUp(trimmedEmail, password)
      : await signIn(trimmedEmail, password)
    setSubmitting(false)

    if (result.error) setError(result.error)
  }

  return (
    <div className="flex h-full flex-col justify-between px-6 py-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            HPU Students Only
          </span>
          <h1 className="text-3xl font-extrabold leading-tight text-foreground">
            {mode === 'sign-up' ? 'Join FunctionFNDR' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'sign-up'
              ? 'Sign up with your .edu email to unlock verified campus nightlife.'
              : 'Sign in with your student account to pick up where you left off.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Student email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@highpoint.edu"
                className="w-full rounded-3xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-3xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === 'sign-up' ? 'Creating account…' : 'Signing in…'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {mode === 'sign-up' ? 'Create student account' : 'Sign in'}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4 text-center">
        <p className="text-xs text-muted-foreground">
          {mode === 'sign-up' ? 'Already verified on campus?' : 'New to FunctionFNDR?'}
        </p>
        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === 'sign-up' ? 'sign-in' : 'sign-up'))
            setError(null)
          }}
          className={cn(
            'text-sm font-semibold text-primary transition hover:text-primary/80',
          )}
        >
          {mode === 'sign-up' ? 'Sign in instead' : 'Create a student account'}
        </button>
      </div>
    </div>
  )
}
