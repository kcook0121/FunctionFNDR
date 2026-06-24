// Hand-written Supabase database types for FunctionFNDR.
//
// Replace later with auto-generated types:
//   pnpm dlx supabase gen types typescript --project-id <ref> > lib/database.types.ts
//
// Keep this file in sync with `supabase/migrations/0001_profiles.sql`.

export type ClassYear =
  | 'Class of 2026'
  | 'Class of 2027'
  | 'Class of 2028'
  | 'Class of 2029'
  | 'Graduate'
  | 'Faculty/Staff'
  | 'Alum'

export const CLASS_YEARS: ClassYear[] = [
  'Class of 2026',
  'Class of 2027',
  'Class of 2028',
  'Class of 2029',
  'Graduate',
  'Faculty/Staff',
  'Alum',
]

export type MusicGenre =
  | 'Hip-Hop'
  | 'House'
  | 'R&B'
  | 'Pop'
  | 'EDM'
  | 'Latin'
  | 'Afrobeats'
  | 'Country'
  | 'Indie'
  | 'Techno'
  | 'Rock'

export const MUSIC_GENRES: MusicGenre[] = [
  'Hip-Hop',
  'House',
  'R&B',
  'Pop',
  'EDM',
  'Latin',
  'Afrobeats',
  'Country',
  'Indie',
  'Techno',
  'Rock',
]

export type University = {
  id: string
  name: string
  city?: string
  state?: string
  domain?: string
}

export const UNIVERSITIES: University[] = [
  { id: 'hpu', name: 'High Point University', city: 'High Point', state: 'NC', domain: 'highpoint.edu' },
  { id: 'unc', name: 'UNC Chapel Hill', state: 'NC', domain: 'unc.edu' },
  { id: 'duke', name: 'Duke University', state: 'NC', domain: 'duke.edu' },
  { id: 'ncsu', name: 'NC State', state: 'NC', domain: 'ncsu.edu' },
  { id: 'wake', name: 'Wake Forest', state: 'NC', domain: 'wfu.edu' },
  { id: 'app-state', name: 'Appalachian State', state: 'NC', domain: 'appstate.edu' },
  { id: 'ecu', name: 'East Carolina University', state: 'NC', domain: 'ecu.edu' },
  { id: 'unc-charlotte', name: 'UNC Charlotte', state: 'NC', domain: 'charlotte.edu' },
  { id: 'elon', name: 'Elon University', state: 'NC', domain: 'elon.edu' },
  { id: 'other', name: 'Other / Not Listed' },
]

// Row as stored in `public.profiles`.
export type Profile = {
  id: string
  full_name: string
  username: string
  university_id: string
  university_name: string
  class_year: ClassYear
  edu_email: string
  music_prefs: MusicGenre[]
  avatar_url: string | null
  bio: string | null
  verified_student: boolean
  created_at: string
  updated_at: string
}

// Shape required to create a new profile row. `verified_student` always
// defaults to false on the server (see migration); clients cannot set it true.
export type ProfileInsert = {
  id: string
  full_name: string
  username: string
  university_id: string
  university_name: string
  class_year: ClassYear
  edu_email: string
  music_prefs: MusicGenre[]
  avatar_url?: string | null
  bio?: string | null
}

export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'verified_student'>
>

// Minimal Database shape so the supabase-js generic picks up profiles.
// postgrest-js requires Tables/Views/Functions to be present and each Table
// entry to declare a Relationships array — even if both are empty.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
