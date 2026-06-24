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

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: StudentProfile | null
  loading: boolean
  profileLoading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  finishOnboarding: (input: OnboardingInput) => Promise<{ error: string | null }>
  saveBio: (bio: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const loadProfile = useCallback(async (user: User) => {
    setProfileLoading(true)
    try {
      const nextProfile = (await fetchProfile(user.id)) ?? (await ensureProfile(user.id, user.email ?? ''))
      setProfile(nextProfile)
    } catch {
      setProfile(null)
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
  }, [])

  const finishOnboarding = useCallback(async (input: OnboardingInput) => {
    if (!session?.user) return { error: 'You must be signed in to finish onboarding.' }
    try {
      const nextProfile = await completeOnboarding(session.user.id, input)
      setProfile(nextProfile)
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save your profile.'
      return { error: message }
    }
  }, [session?.user])

  const saveBio = useCallback(async (bio: string) => {
    if (!session?.user) return { error: 'You must be signed in to update your profile.' }
    try {
      const nextProfile = await updateProfileBio(session.user.id, bio)
      setProfile(nextProfile)
      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update your bio.'
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
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      finishOnboarding,
      saveBio,
      refreshProfile,
    }),
    [session, profile, loading, profileLoading, signUp, signIn, signOut, finishOnboarding, saveBio, refreshProfile],
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
