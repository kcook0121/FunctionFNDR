'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import {
  createProfile as createProfileService,
  fetchProfile,
  updateProfile as updateProfileService,
} from '@/lib/auth/profile-service'
import type { ClassYear, MusicGenre, Profile, ProfileInsert, ProfileUpdate } from '@/lib/database.types'
import { currentUser as mockUser } from '@/lib/data'

export type AuthMode = 'guest' | 'real'

// State machine for what to render at the app root:
//   loading           — figuring out session/profile
//   unauthenticated   — real mode, no session   → <AuthScreen>
//   needs_onboarding  — real mode, signed in, but no profile row exists
//                       (this is also the state we land in when the schema
//                       isn't applied yet, per the product spec)
//   ready             — profile loaded; render the app
export type AuthStatus = 'loading' | 'unauthenticated' | 'needs_onboarding' | 'ready'

type SignUpResult = { error: string | null; needsEmailConfirm: boolean }
type WriteResult = { error: string | null }

type AuthContextValue = {
  mode: AuthMode
  status: AuthStatus
  user: User | null
  profile: Profile | null
  signInWithPassword: (email: string, password: string) => Promise<WriteResult>
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  completeOnboarding: (input: Omit<ProfileInsert, 'id'>) => Promise<WriteResult>
  updateMyProfile: (patch: ProfileUpdate) => Promise<WriteResult>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Synthesize a Profile from the legacy lib/data mock so the existing UI keeps
// working when Supabase isn't configured (demo / preview environments).
function buildMockProfile(): Profile {
  const now = new Date().toISOString()
  return {
    id: mockUser.id,
    full_name: mockUser.name,
    username: 'cassiehart',
    university_id: 'hpu',
    university_name: mockUser.school,
    class_year: 'Class of 2027' as ClassYear,
    edu_email: 'cassie.hart@highpoint.edu',
    music_prefs: mockUser.musicPrefs as MusicGenre[],
    avatar_url: mockUser.avatar,
    bio: mockUser.bio,
    verified_student: mockUser.verified,
    created_at: now,
    updated_at: now,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: AuthMode = isSupabaseConfigured ? 'real' : 'guest'
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Tracks the most recent session-user id we tried to load, so async resolves
  // for stale users don't clobber newer state.
  const loadingForRef = useRef<string | null>(null)

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      loadingForRef.current = null
      setUser(null)
      setProfile(null)
      setStatus('unauthenticated')
      return
    }

    setUser(session.user)
    setStatus('loading')
    loadingForRef.current = session.user.id

    const result = await fetchProfile(session.user.id)
    // Bail if a newer auth event has already taken over.
    if (loadingForRef.current !== session.user.id) return

    if (result.status === 'ok') {
      setProfile(result.profile)
      setStatus('ready')
      return
    }

    // Per spec: in real Supabase mode, a signed-in user with no profile row
    // (or with a missing schema) MUST be routed to onboarding — never auto-
    // promoted to "ready".
    setProfile(null)
    setStatus('needs_onboarding')
  }, [])

  useEffect(() => {
    if (mode === 'guest') {
      setUser(null)
      setProfile(buildMockProfile())
      setStatus('ready')
      return
    }

    let cancelled = false

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      await applySession(data.session)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      void applySession(session)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [mode, applySession])

  const signInWithPassword = useCallback<AuthContextValue['signInWithPassword']>(
    async (email, password) => {
      if (mode === 'guest') return { error: 'Supabase is not configured.' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    [mode],
  )

  const signUpWithPassword = useCallback<AuthContextValue['signUpWithPassword']>(
    async (email, password) => {
      if (mode === 'guest') {
        return { error: 'Supabase is not configured.', needsEmailConfirm: false }
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message, needsEmailConfirm: false }
      // If email confirmation is on in the Supabase project, `data.session`
      // is null until the user clicks the confirmation link.
      return { error: null, needsEmailConfirm: !data.session }
    },
    [mode],
  )

  const signOut = useCallback(async () => {
    if (mode === 'guest') return
    await supabase.auth.signOut()
  }, [mode])

  const completeOnboarding = useCallback<AuthContextValue['completeOnboarding']>(
    async (input) => {
      if (mode === 'guest') return { error: 'Supabase is not configured.' }
      if (!user) return { error: 'Not signed in.' }

      const result = await createProfileService({ id: user.id, ...input })
      if (result.status === 'ok') {
        setProfile(result.profile)
        setStatus('ready')
        return { error: null }
      }
      if (result.status === 'duplicate_username') {
        return { error: 'That username is already taken.' }
      }
      if (result.status === 'schema_missing') {
        return {
          error:
            'Profiles table missing — run supabase/migrations/0001_profiles.sql in your Supabase project, then retry.',
        }
      }
      return { error: result.message }
    },
    [mode, user],
  )

  const updateMyProfile = useCallback<AuthContextValue['updateMyProfile']>(
    async (patch) => {
      if (mode === 'guest') {
        // Optimistic local update so the mock UI still feels alive.
        setProfile((current) => (current ? { ...current, ...patch } as Profile : current))
        return { error: null }
      }
      if (!user) return { error: 'Not signed in.' }

      const result = await updateProfileService(user.id, patch)
      if (result.status === 'ok') {
        setProfile(result.profile)
        return { error: null }
      }
      if (result.status === 'schema_missing') {
        return { error: 'Profiles table missing — run the SQL migration first.' }
      }
      if (result.status === 'duplicate_username') {
        return { error: 'That username is already taken.' }
      }
      return { error: result.message }
    },
    [mode, user],
  )

  const refresh = useCallback(async () => {
    if (mode === 'guest') return
    const { data } = await supabase.auth.getSession()
    await applySession(data.session)
  }, [mode, applySession])

  const value = useMemo<AuthContextValue>(
    () => ({
      mode,
      status,
      user,
      profile,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      completeOnboarding,
      updateMyProfile,
      refresh,
    }),
    [
      mode,
      status,
      user,
      profile,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      completeOnboarding,
      updateMyProfile,
      refresh,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
