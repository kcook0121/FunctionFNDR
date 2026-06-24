'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, CheckCircle2, Edit3, Loader2, LogOut, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { getMyEvents, type EventRecord, type MyEventsGroups } from '@/lib/events/event-service'
import { cn } from '@/lib/utils'

const EMPTY_MY_EVENTS: MyEventsGroups = {
  created: [],
  saved: [],
  going: [],
  interested: [],
}

type ProfileSummaryProps = {
  onOpenEvent?: (eventId: string) => void
}

function formatEventDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export function ProfileSummary({ onOpenEvent }: ProfileSummaryProps) {
  const { user, profile, saveBio, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [draftBio, setDraftBio] = useState(profile?.bio ?? '')
  const [myEvents, setMyEvents] = useState<MyEventsGroups>(EMPTY_MY_EVENTS)
  const [myEventsSource, setMyEventsSource] = useState<'supabase' | 'mock'>('mock')
  const [loadingMyEvents, setLoadingMyEvents] = useState(false)

  const tierBadge = useMemo(() => {
    switch (profile?.promoterTier) {
      case 'Headliner':
        return 'Headliner'
      case 'Campus Rep':
        return 'Campus Rep'
      case 'Plug':
        return 'Plug'
      default:
        return 'Rookie'
    }
  }, [profile?.promoterTier])

  useEffect(() => {
    if (!open || !user) return

    let mounted = true
    setLoadingMyEvents(true)

    getMyEvents(user.id)
      .then((result) => {
        if (!mounted) return
        setMyEvents(result.groups)
        setMyEventsSource(result.source)
      })
      .finally(() => {
        if (mounted) setLoadingMyEvents(false)
      })

    return () => {
      mounted = false
    }
  }, [open, user])

  if (!profile) return null

  async function saveProfile() {
    const result = await saveBio(draftBio)
    if (result.error) {
      setToast(result.error)
    } else {
      setIsEditing(false)
      setToast('Profile updated')
    }
    window.setTimeout(() => setToast(null), 1600)
  }

  function handleOpenEvent(eventId: string) {
    setOpen(false)
    onOpenEvent?.(eventId)
  }

  const myEventSections = [
    {
      key: 'created',
      title: 'Created Events',
      events: myEvents.created,
      emptyMessage: 'No created events yet. Publish one from the Create tab.',
    },
    {
      key: 'saved',
      title: 'Saved Events',
      events: myEvents.saved,
      emptyMessage: 'No saved events yet. Bookmark events from Tickets.',
    },
    {
      key: 'going',
      title: 'Going',
      events: myEvents.going,
      emptyMessage: 'No going RSVPs yet. Mark yourself as going from Tickets.',
    },
    {
      key: 'interested',
      title: 'Interested',
      events: myEvents.interested,
      emptyMessage: 'No interested RSVPs yet. Tap Maybe on an event in Tickets.',
    },
  ] as const

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraftBio(profile.bio)
          setOpen(true)
        }}
        className="inline-flex items-center gap-3 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-card"
      >
        <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
          <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-foreground">{profile.name}</span>
          <span className="block text-[10px] text-muted-foreground">{profile.school}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-md overflow-hidden rounded-[32px] border border-border bg-[#111117]/95 shadow-[0_0_45px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profile</p>
                <h2 className="text-xl font-extrabold text-foreground">Student Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:border-primary/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl ring-1 ring-border">
                  <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-foreground">{profile.name}</h3>
                    {profile.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Student
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.school} · {profile.year}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#1b1b21] px-3 py-1 text-xs font-semibold text-foreground">
                    {tierBadge}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Bio</p>
                    <p className="mt-2 text-sm text-foreground">{profile.bio}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50"
                  >
                    <Edit3 className="h-4 w-4" /> {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {isEditing && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={draftBio}
                      onChange={(event) => setDraftBio(event.target.value)}
                      rows={4}
                      className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={saveProfile}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Sparkles className="h-4 w-4" /> Save Profile
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Created', value: myEvents.created.length },
                  { label: 'Saved', value: myEvents.saved.length },
                  { label: 'Going', value: myEvents.going.length },
                  { label: 'Interested', value: myEvents.interested.length },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-border bg-background p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-xl font-extrabold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">My Events</p>
                  {loadingMyEvents && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                {myEventsSource === 'mock' && !loadingMyEvents && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Showing sample data until Supabase my-events queries are configured.
                  </p>
                )}

                <div className="mt-4 space-y-4">
                  {myEventSections.map((section) => (
                    <MyEventsSection
                      key={section.key}
                      title={section.title}
                      events={section.events}
                      emptyMessage={section.emptyMessage}
                      onOpenEvent={handleOpenEvent}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Music preferences</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.musicPrefs.map((genre) => (
                    <span key={genre} className="rounded-full bg-background px-3 py-1 text-[11px] font-semibold text-foreground">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Promoter Score', value: profile.promoterTier },
                  { label: 'Referrals', value: `${profile.referrals}` },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-border bg-background p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-xl font-extrabold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void signOut()}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive',
                )}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
          {toast && (
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#141418] px-5 py-3 text-sm font-semibold text-foreground shadow-[0_0_25px_rgba(0,0,0,0.45)]">
              {toast}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function MyEventsSection({
  title,
  events,
  emptyMessage,
  onOpenEvent,
}: {
  title: string
  events: EventRecord[]
  emptyMessage: string
  onOpenEvent: (eventId: string) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {events.map((event) => {
            const { date, time } = formatEventDateTime(event.date_time)
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onOpenEvent(event.id)}
                className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left transition hover:border-primary/50"
              >
                <span className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
                  <Image src={event.image ?? '/event-1.png'} alt={event.title} fill className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{event.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {event.host_name} · {event.venue_type}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {date} · {time}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
