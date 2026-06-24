'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Music2, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

const YEAR_OPTIONS = [
  'Class of 2026',
  'Class of 2027',
  'Class of 2028',
  'Class of 2029',
  'Grad Student',
] as const

const GENRE_OPTIONS = ['Hip-Hop', 'House', 'R&B', 'Pop', 'Techno', 'Greek Life'] as const

export function OnboardingScreen() {
  const { profile, finishOnboarding } = useAuth()
  const [name, setName] = useState('')
  const [school, setSchool] = useState(profile?.school ?? 'High Point University')
  const [year, setYear] = useState<(typeof YEAR_OPTIONS)[number]>('Class of 2027')
  const [bio, setBio] = useState('')
  const [musicPrefs, setMusicPrefs] = useState<string[]>(['Hip-Hop', 'House'])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailLabel = useMemo(() => profile?.email ?? 'your .edu email', [profile?.email])

  function toggleGenre(genre: string) {
    setMusicPrefs((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre],
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Add your name so friends can find you on campus.')
      return
    }

    if (!school.trim()) {
      setError('Tell us which school you represent.')
      return
    }

    if (musicPrefs.length === 0) {
      setError('Pick at least one music vibe.')
      return
    }

    setSubmitting(true)
    const result = await finishOnboarding({
      name: name.trim(),
      school: school.trim(),
      year,
      bio: bio.trim() || 'Ready for the next campus function.',
      musicPrefs,
    })
    setSubmitting(false)

    if (result.error) setError(result.error)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          <UserRound className="h-3.5 w-3.5" />
          Student profile
        </span>
        <h1 className="text-3xl font-extrabold text-foreground">Build your campus profile</h1>
        <p className="text-sm text-muted-foreground">
          Verified with <span className="font-semibold text-foreground">{emailLabel}</span>. Finish setup to unlock the vibe map, tickets, and earn tab.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 pb-8">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Full name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cassie Hart"
            className="w-full rounded-3xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            School
          </span>
          <input
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            placeholder="High Point University"
            className="w-full rounded-3xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Graduation year
          </span>
          <div className="grid grid-cols-2 gap-2">
            {YEAR_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setYear(option)}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition',
                  year === option
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:border-primary/40',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            placeholder="Campus connector, weekend social director, always on the guest list."
            className="w-full rounded-3xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Music preferences
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const active = musicPrefs.includes(genre)
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    'rounded-full px-3 py-2 text-xs font-semibold transition',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background text-foreground hover:border-primary/40',
                  )}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>

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
              Saving profile…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Enter FunctionFNDR
            </>
          )}
        </button>
      </form>
    </div>
  )
}
