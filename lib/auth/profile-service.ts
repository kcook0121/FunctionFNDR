import { supabase } from '@/lib/supabaseClient'

export type PromoterTier = 'Rookie' | 'Plug' | 'Campus Rep' | 'Headliner'

export type StudentProfile = {
  id: string
  email: string
  avatarUrl: string
  name: string
  school: string
  year: string
  bio: string
  savedEvents: string[]
  attendedEvents: string[]
  musicPrefs: string[]
  promoterTier: PromoterTier
  verified: boolean
  referrals: number
  ticketsSold: number
  partiesPromoted: number
  onboardingComplete: boolean
}

export type OnboardingInput = {
  name: string
  school: string
  year: string
  bio: string
  musicPrefs: string[]
  avatarUrl?: string
}

type ProfileRow = {
  id: string
  email: string
  avatar_url: string | null
  name: string | null
  school: string | null
  year: string | null
  bio: string | null
  saved_events: string[] | null
  attended_events: string[] | null
  music_prefs: string[] | null
  promoter_tier: string | null
  verified: boolean | null
  referrals: number | null
  tickets_sold: number | null
  parties_promoted: number | null
  onboarding_complete: boolean | null
}

const EDU_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.edu$/i

export function isEduEmail(email: string): boolean {
  return EDU_EMAIL_PATTERN.test(email.trim())
}

function mapRow(row: ProfileRow): StudentProfile {
  const tier = row.promoter_tier as PromoterTier | null
  return {
    id: row.id,
    email: row.email,
    avatarUrl: row.avatar_url ?? '/user-avatar.png',
    name: row.name ?? '',
    school: row.school ?? '',
    year: row.year ?? '',
    bio: row.bio ?? '',
    savedEvents: row.saved_events ?? [],
    attendedEvents: row.attended_events ?? [],
    musicPrefs: row.music_prefs ?? [],
    promoterTier: tier ?? 'Rookie',
    verified: row.verified ?? false,
    referrals: row.referrals ?? 0,
    ticketsSold: row.tickets_sold ?? 0,
    partiesPromoted: row.parties_promoted ?? 0,
    onboardingComplete: row.onboarding_complete ?? false,
  }
}

function schoolFromEmail(email: string): string {
  const domain = email.split('@')[1]?.replace(/\.edu$/i, '') ?? ''
  if (!domain) return ''
  const label = domain.split('.')[0] ?? domain
  return label
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function fetchProfile(userId: string): Promise<StudentProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapRow(data as ProfileRow)
}

export async function ensureProfile(userId: string, email: string): Promise<StudentProfile> {
  const existing = await fetchProfile(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      verified: isEduEmail(email),
      school: schoolFromEmail(email) || null,
      onboarding_complete: false,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data as ProfileRow)
}

export async function completeOnboarding(
  userId: string,
  input: OnboardingInput,
): Promise<StudentProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim(),
      school: input.school.trim(),
      year: input.year.trim(),
      bio: input.bio.trim(),
      music_prefs: input.musicPrefs,
      avatar_url: input.avatarUrl ?? '/user-avatar.png',
      onboarding_complete: true,
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data as ProfileRow)
}

export async function updateProfileBio(userId: string, bio: string): Promise<StudentProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ bio: bio.trim() })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return mapRow(data as ProfileRow)
}
