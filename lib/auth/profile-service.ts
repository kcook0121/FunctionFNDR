import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/lib/database.types'

// Postgres error code 42P01  → "relation does not exist"
// PostgREST  error code PGRST205 → "Could not find the table 'X' in the schema cache"
// These are the signals that the migration hasn't been applied yet.
const SCHEMA_MISSING_CODES = new Set(['42P01', 'PGRST205'])

// Postgres error code 23505 → unique_violation (e.g. username already taken).
const UNIQUE_VIOLATION_CODE = '23505'

function isPgError(error: unknown): error is { code?: string; message: string } {
  return typeof error === 'object' && error !== null && 'message' in error
}

export type ProfileFetchResult =
  | { status: 'ok'; profile: Profile }
  | { status: 'not_found' }
  | { status: 'schema_missing' }
  | { status: 'unavailable'; message?: string }

export async function fetchProfile(userId: string): Promise<ProfileFetchResult> {
  if (!isSupabaseConfigured) return { status: 'unavailable' }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      const code = isPgError(error) ? error.code : undefined
      if (code && SCHEMA_MISSING_CODES.has(code)) {
        // eslint-disable-next-line no-console
        console.warn(
          '[FunctionFNDR] profiles table missing — run supabase/migrations/0001_profiles.sql to enable real profiles.',
        )
        return { status: 'schema_missing' }
      }
      // eslint-disable-next-line no-console
      console.warn('[FunctionFNDR] fetchProfile error:', error)
      return { status: 'unavailable', message: error.message }
    }

    if (!data) return { status: 'not_found' }
    return { status: 'ok', profile: data as Profile }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[FunctionFNDR] fetchProfile unexpected error:', err)
    return { status: 'unavailable', message: (err as Error).message }
  }
}

export type ProfileWriteResult =
  | { status: 'ok'; profile: Profile }
  | { status: 'schema_missing' }
  | { status: 'duplicate_username' }
  | { status: 'error'; message: string }

export async function createProfile(input: ProfileInsert): Promise<ProfileWriteResult> {
  if (!isSupabaseConfigured) {
    return { status: 'error', message: 'Supabase is not configured.' }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      // verified_student is intentionally NOT sent from the client.
      // The DB column defaults to false; a future server-only verification flow
      // (SheerID / .edu OTP) is the only thing that should flip it true.
      .insert(input)
      .select('*')
      .single()

    if (error) {
      const code = isPgError(error) ? error.code : undefined
      if (code && SCHEMA_MISSING_CODES.has(code)) return { status: 'schema_missing' }
      if (code === UNIQUE_VIOLATION_CODE) return { status: 'duplicate_username' }
      return { status: 'error', message: error.message }
    }

    return { status: 'ok', profile: data as Profile }
  } catch (err) {
    return { status: 'error', message: (err as Error).message }
  }
}

export async function updateProfile(
  userId: string,
  patch: ProfileUpdate,
): Promise<ProfileWriteResult> {
  if (!isSupabaseConfigured) {
    return { status: 'error', message: 'Supabase is not configured.' }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      const code = isPgError(error) ? error.code : undefined
      if (code && SCHEMA_MISSING_CODES.has(code)) return { status: 'schema_missing' }
      if (code === UNIQUE_VIOLATION_CODE) return { status: 'duplicate_username' }
      return { status: 'error', message: error.message }
    }

    return { status: 'ok', profile: data as Profile }
  } catch (err) {
    return { status: 'error', message: (err as Error).message }
  }
}
