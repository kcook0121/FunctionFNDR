'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, Edit3, LogOut, Sparkles, X } from 'lucide-react'
import { currentUser } from '@/lib/data'
import { useAuth } from '@/lib/auth/auth-context'

export function ProfileSummary() {
  const { profile: authProfile, mode, signOut, updateMyProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftBio, setDraftBio] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Adapt the DB-shaped Profile into the view-model the existing UI was built
  // against. Falls back to lib/data.ts mock when no auth profile is loaded
  // (guest mode), so the UI never has to deal with nulls.
  const view = useMemo(() => {
    if (authProfile) {
      return {
        avatar: authProfile.avatar_url || '/placeholder-user.jpg',
        name: authProfile.full_name,
        school: authProfile.university_name,
        year: authProfile.class_year,
        bio: authProfile.bio ?? '',
        verified: authProfile.verified_student,
        musicPrefs: authProfile.music_prefs,
        savedEvents: currentUser.savedEvents,
        attendedEvents: currentUser.attendedEvents,
        promoterTier: currentUser.promoterTier,
        referrals: currentUser.referrals,
      }
    }
    return {
      avatar: '/placeholder-user.jpg',
      name: currentUser.name,
      school: currentUser.school,
      year: currentUser.year,
      bio: currentUser.bio,
      verified: currentUser.verified,
      musicPrefs: currentUser.musicPrefs,
      savedEvents: currentUser.savedEvents,
      attendedEvents: currentUser.attendedEvents,
      promoterTier: currentUser.promoterTier,
      referrals: currentUser.referrals,
    }
  }, [authProfile])

  useEffect(() => {
    setDraftBio(view.bio)
  }, [view.bio])

  const tierBadge = useMemo(() => {
    switch (view.promoterTier) {
      case 'Headliner':
        return 'Headliner'
      case 'Campus Rep':
        return 'Campus Rep'
      case 'Plug':
        return 'Plug'
      default:
        return 'Rookie'
    }
  }, [view.promoterTier])

  function flashToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 1800)
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await updateMyProfile({ bio: draftBio })
    setSaving(false)
    if (error) {
      flashToast(`Update failed: ${error}`)
      return
    }
    setIsEditing(false)
    flashToast('Profile updated')
  }

  async function handleSignOut() {
    await signOut()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-3 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-card"
      >
        <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
          <Image src={view.avatar} alt={view.name} fill className="object-cover" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-foreground">{view.name}</span>
          <span className="block text-[10px] text-muted-foreground">{view.school}</span>
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
                  <Image src={view.avatar} alt={view.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-extrabold text-foreground">{view.name}</h3>
                    {view.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Student
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {view.school} · {view.year}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#1b1b21] px-3 py-1 text-xs font-semibold text-foreground">
                    {tierBadge}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Bio</p>
                    <p className="mt-2 text-sm text-foreground">
                      {view.bio || <span className="text-muted-foreground">No bio yet.</span>}
                    </p>
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
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      <Sparkles className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Profile'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Saved', value: view.savedEvents.length },
                  { label: 'Attended', value: view.attendedEvents.length },
                  { label: 'Promoter Score', value: view.promoterTier },
                  { label: 'Referrals', value: `${view.referrals}` },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-3xl border border-border bg-background p-4">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-xl font-extrabold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Music preferences</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {view.musicPrefs.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None selected.</span>
                  ) : (
                    view.musicPrefs.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-background px-3 py-1 text-[11px] font-semibold text-foreground"
                      >
                        {genre}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Sign-out only makes sense when a real session exists. */}
              {mode === 'real' && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:border-destructive/60 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}

              {mode === 'guest' && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Guest preview mode — sign-in disabled until Supabase env vars are set.
                </p>
              )}
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
