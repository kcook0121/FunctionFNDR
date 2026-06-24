'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import {
  completeOnboarding,
  ensureProfile,
  fetchProfile,
  type OnboardingInput,
  type StudentProfile,
  updateProfileBio,
} from '@/lib/auth/profile-service'
import {
  getUserEventEngagement,
  saveEvent as saveEventRecord,
  setRsvp as setRsvpRecord,
  unsaveEvent as unsaveEventRecord,
  type RsvpStatus,
} from '@/lib/events/event-service'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: StudentProfile | null
  savedEventIds: string[]
  rsvps: Record<string, RsvpStatus>
  loading: boolean
  profileLoading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  finishOnboarding: (input: OnboardingInput) => Promise<{ error: string | null }>
  saveBio: (bio: string) => Promise<{ error: string | null }>
  saveEvent: (eventId: string) => Promise<{ error: string | null }>
  unsaveEvent: (eventId: string) => Promise<{ error: string | null }>
  setRsvp: (eventId: string, status: RsvpStatus) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mergeEngagementIntoProfile(
  profile: StudentProfile,
  savedEventIds: string[],
  attendedEventIds: string[],
  engagementLoaded: boolean,
): StudentProfile {
  if (!engagementLoaded) return profile
  return {
    ...profile,
    savedEvents: savedEventIds,
    attendedEvents: attendedEventIds,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [savedEventIds, setSavedEventIds] = useState<string[]>([])
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({})
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = useCallback(async (user: User) => {
    setProfileLoading(true)
    try {
      const baseProfile = (await fetchProfile(user.id)) ?? (await ensureProfile(user.id, user.email ?? ''))
      let nextSavedIds: string[] = []
      let nextRsvps: Record<string, RsvpStatus> = {}
      let attendedEventIds: string[] = []
      let engagementLoaded = false

      try {
        const engagement = await getUserEventEngagement(user.id)
        nextSavedIds = engagement.savedEventIds
        nextRsvps = engagement.rsvps
        attendedEventIds = engagement.attendedEventIds
        engagementLoaded = true
      } catch {
        // Fall back to profile array fields when engagement tables are unavailable.
      }

      setSavedEventIds(nextSavedIds)
      setRsvps(nextRsvps)
      setProfile(mergeEngagementIntoProfile(baseProfile, nextSavedIds, attendedEventIds, engagementLoaded))
    } catch {
      setProfile(null)
      setSavedEventIds([])
      setRsvps({})
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user) {
        void loadProfile(data.session.user)
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        void loadProfile(nextSession.user)
      } else {
        setProfile(null)
        setSavedEventIds([])
        setRsvps({})
        setProfileLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      await ensureProfile(data.user.id, email)
      await loadProfile(data.user)
    }
    return { error: null }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) await loadProfile(data.user)
    return { error: null }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSavedEventIds([])
    setRsvps({})
  }, [])

  const finishOnboarding = useCallback(async (input: OnboardingInput) => {
    if (!session?.user) return { error: 'You must be signed in to finish onboarding.' }
    try {
      const nextProfile = await completeOnboarding(session.user.id, input)
      setProfile((current) =>
        current
          ? mergeEngagementIntoProfile(
              nextProfile,
              savedEventIds,
              Object.entries(rsvps).filter(([, s]) => s === 'yes').map(([id]) => id),
              true,
            )
          : nextProfile,
      )
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your profile.'
      return { error: message }
    }
  }, [session?.user, savedEventIds, rsvps])

  const saveBio = useCallback(async (bio: string) => {
    if (!session?.user) return { error: 'You must be signed in to update your profile.' }
    try {
      const nextProfile = await updateProfileBio(session.user.id, bio)
      setProfile((current) =>
        current
          ? mergeEngagementIntoProfile(
              nextProfile,
              savedEventIds,
              Object.entries(rsvps).filter(([, s]) => s === 'yes').map(([id]) => id),
              true,
            )
          : nextProfile,
      )
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update your bio.'
      return { error: message }
    }
  }, [session?.user, savedEventIds, rsvps])

  const saveEvent = useCallback(async (eventId: string) => {
    if (!session?.user) return { error: 'Sign in to save events.' }
    try {
      await saveEventRecord(session.user.id, eventId)
      setSavedEventIds((current) => {
        if (current.includes(eventId)) return current
        const next = [...current, eventId]
        setProfile((profile) => (profile ? { ...profile, savedEvents: next } : profile))
        return next
      })
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save event.'
      return { error: message }
    }
  }, [session?.user])

  const unsaveEvent = useCallback(async (eventId: string) => {
    if (!session?.user) return { error: 'Sign in to manage saved events.' }
    try {
      await unsaveEventRecord(session.user.id, eventId)
      setSavedEventIds((current) => {
        const next = current.filter((id) => id !== eventId)
        setProfile((profile) => (profile ? { ...profile, savedEvents: next } : profile))
        return next
      })
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not remove saved event.'
      return { error: message }
    }
  }, [session?.user])

  const setRsvp = useCallback(async (eventId: string, status: RsvpStatus) => {
    if (!session?.user) return { error: 'Sign in to RSVP.' }
    try {
      await setRsvpRecord(session.user.id, eventId, status)
      setRsvps((current) => {
        const next = { ...current, [eventId]: status }
        const attended = Object.entries(next)
          .filter(([, value]) => value === 'yes')
          .map(([id]) => id)
        setProfile((profile) => (profile ? { ...profile, attendedEvents: attended } : profile))
        return next
      })
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update RSVP.'
      return { error: message }
    }
  }, [session?.user])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await loadProfile(session.user)
  }, [loadProfile, session?.user])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      savedEventIds,
      rsvps,
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      finishOnboarding,
      saveBio,
      saveEvent,
      unsaveEvent,
      setRsvp,
      refreshProfile,
    }),
    [
      session,
      profile,
      savedEventIds,
      rsvps,
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      finishOnboarding,
      saveBio,
      saveEvent,
      unsaveEvent,
      setRsvp,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { RsvpStatus } from '@/lib/events/event-service'
