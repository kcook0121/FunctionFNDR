'use client'

import { useState } from 'react'
import { CalendarPlus, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { createEvent, type CreateEventInput } from '@/lib/events/event-service'

const GENRE_OPTIONS = ['Hip-Hop', 'House', 'R&B', 'Pop', 'Techno', 'Greek Life'] as const

const initialForm: CreateEventInput = {
  title: '',
  university: 'High Point University',
  venue: '',
  address: '',
  date: '',
  startTime: '21:00',
  endTime: '02:00',
  coverPrice: 5,
  capacity: 150,
  musicGenre: 'Hip-Hop',
  description: '',
  imageUrl: '',
}

type CreateEventProps = {
  onCreated?: () => void
}

export function CreateEvent({ onCreated }: CreateEventProps) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState<CreateEventInput>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function updateField<K extends keyof CreateEventInput>(key: K, value: CreateEventInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!user) {
      setError('Sign in to create an event.')
      return
    }

    if (!form.title.trim() || !form.venue.trim() || !form.address.trim() || !form.date) {
      setError('Fill in the event name, venue, address, and date.')
      return
    }

    if (!form.description.trim()) {
      setError('Add a short description so students know what to expect.')
      return
    }

    if (form.coverPrice < 0 || form.capacity < 1) {
      setError('Cover price must be zero or higher and capacity must be at least 1.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createEvent(user.id, profile?.name ?? 'Campus Host', form)
      setSuccessMessage(`"${created.title}" is live in Tickets.`)
      setForm({
        ...initialForm,
        university: form.university,
      })
      onCreated?.()
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Could not create event.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="no-scrollbar h-full overflow-y-auto pb-32">
        <div className="px-4 pt-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            <CalendarPlus className="h-3.5 w-3.5" />
            Host tools
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">Create Event</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Publish a campus function directly to Tickets. You&apos;ll be set as the event host.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4 pb-10">
          <Field label="Event Name">
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Neon Rooftop Rager"
              className={inputClassName}
            />
          </Field>

          <Field label="University">
            <input
              value={form.university}
              onChange={(event) => updateField('university', event.target.value)}
              placeholder="High Point University"
              className={inputClassName}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue">
              <input
                value={form.venue}
                onChange={(event) => updateField('venue', event.target.value)}
                placeholder="Skyline Terrace"
                className={inputClassName}
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="123 Main St, High Point, NC"
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Start Time">
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => updateField('startTime', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="End Time">
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => updateField('endTime', event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cover Price ($)">
              <input
                type="number"
                min={0}
                step={1}
                value={form.coverPrice}
                onChange={(event) => updateField('coverPrice', Number(event.target.value))}
                className={inputClassName}
              />
            </Field>
            <Field label="Capacity">
              <input
                type="number"
                min={1}
                step={1}
                value={form.capacity}
                onChange={(event) => updateField('capacity', Number(event.target.value))}
                className={inputClassName}
              />
            </Field>
          </div>

          <Field label="Music Genre">
            <select
              value={form.musicGenre}
              onChange={(event) => updateField('musicGenre', event.target.value)}
              className={inputClassName}
            >
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              rows={4}
              placeholder="Tell students what makes this function worth showing up for."
              className={inputClassName}
            />
          </Field>

          <Field label="Event Image URL (optional)">
            <input
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="/event-1.png"
              className={inputClassName}
            />
          </Field>

          {error && (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {successMessage}
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
                Publishing event…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Publish to Tickets
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputClassName =
  'w-full rounded-3xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
