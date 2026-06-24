'use client'

import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import {
  CLASS_YEARS,
  MUSIC_GENRES,
  UNIVERSITIES,
  type ClassYear,
  type MusicGenre,
  type University,
} from '@/lib/database.types'

const USERNAME_REGEX = /^[a-z0-9_.]{3,24}$/i
const EDU_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.edu$/i

const inputClass =
  'w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary'

export function OnboardingScreen() {
  const { completeOnboarding, signOut, user } = useAuth()

  const initialEduEmail = user?.email && EDU_EMAIL_REGEX.test(user.email) ? user.email : ''

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [universityId, setUniversityId] = useState<string>(UNIVERSITIES[0].id)
  const [classYear, setClassYear] = useState<ClassYear>('Class of 2027')
  const [eduEmail, setEduEmail] = useState(initialEduEmail)
  const [musicPrefs, setMusicPrefs] = useState<MusicGenre[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const university: University = useMemo(
    () => UNIVERSITIES.find((u) => u.id === universityId) ?? UNIVERSITIES[0],
    [universityId],
  )

  function toggleGenre(genre: MusicGenre) {
    setMusicPrefs((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!fullName.trim()) return setError('Add your full name.')
    if (!USERNAME_REGEX.test(username)) {
      return setError('Username must be 3–24 chars (letters, numbers, _ or .).')
    }
    if (!EDU_EMAIL_REGEX.test(eduEmail)) {
      return setError('Use a valid .edu email so we can verify you later.')
    }
    if (musicPrefs.length === 0) {
      return setError('Pick at least one music preference.')
    }

    setSubmitting(true)
    const { error: writeError } = await completeOnboarding({
      full_name: fullName.trim(),
      username: username.toLowerCase().trim(),
      university_id: university.id,
      university_name: university.name,
      class_year: classYear,
      edu_email: eduEmail.toLowerCase().trim(),
      music_prefs: musicPrefs,
    })
    setSubmitting(false)
    if (writeError) setError(writeError)
  }

  return (
    <div className="no-scrollbar h-full w-full overflow-y-auto bg-background">
      <div className="px-6 pb-10 pt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">Step 1 of 1</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Build your profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We&rsquo;ll use this to verify you&rsquo;re a student and personalize your map.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClass}
              placeholder="Cassie Hart"
              autoComplete="name"
            />
          </Field>

          <Field label="Username">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClass}
              placeholder="cassiehart"
              autoCapitalize="none"
              autoComplete="off"
            />
          </Field>

          <Field label="Home university">
            <select
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              className={inputClass}
            >
              {UNIVERSITIES.map((u) => (
                <option key={u.id} value={u.id} className="bg-background">
                  {u.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class year">
            <select
              value={classYear}
              onChange={(event) => setClassYear(event.target.value as ClassYear)}
              className={inputClass}
            >
              {CLASS_YEARS.map((year) => (
                <option key={year} value={year} className="bg-background">
                  {year}
                </option>
              ))}
            </select>
          </Field>

          <Field label=".edu email">
            <input
              type="email"
              value={eduEmail}
              onChange={(event) => setEduEmail(event.target.value)}
              className={inputClass}
              placeholder="you@school.edu"
              autoCapitalize="none"
              autoComplete="email"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Used later to verify you&rsquo;re an enrolled student. Stays private.
            </p>
          </Field>

          <Field label="Music preferences">
            <div className="mt-1 flex flex-wrap gap-2">
              {MUSIC_GENRES.map((genre) => {
                const active = musicPrefs.includes(genre)
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={
                      'rounded-full border px-3 py-1.5 text-[11px] font-bold transition ' +
                      (active
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50')
                    }
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </Field>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving\u2026' : 'Finish & enter FunctionFNDR'}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}
