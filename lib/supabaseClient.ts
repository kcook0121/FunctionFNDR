import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Single source of truth for "do we have a real backend?".
// The whole app branches on this flag so the demo never throws.
export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey)

// Placeholder credentials used only when env vars are missing. The client is
// still constructed so callers (e.g. components/ticket-gate.tsx) can `import { supabase }`
// without null-checks; their existing try/catch fallbacks handle the network
// failure that follows on any real request.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export const supabase = createClient<Database>(
  supabaseUrl ?? PLACEHOLDER_URL,
  supabaseAnonKey ?? PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  },
)

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[FunctionFNDR] Supabase env vars missing — running in guest/mock mode. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable auth.',
  )
}
