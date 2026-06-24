import { supabase } from '@/lib/supabaseClient'

export type RsvpStatus = 'yes' | 'maybe' | 'no'

export type EventRecord = {
  id: string
  title: string
  host_name: string
  venue_type: string
  ticket_price_ga: number
  ticket_price_vip: number
  theme_tag: string
  date_time: string
  image?: string
  detail?: string
  location?: string
}

export type UserEventEngagement = {
  savedEventIds: string[]
  rsvps: Record<string, RsvpStatus>
  attendedEventIds: string[]
}

type EventRow = {
  id: string
  title: string
  host_name: string
  venue_type: string
  ticket_price_ga: number
  ticket_price_vip: number
  theme_tag: string | null
  date_time: string
  image: string | null
  detail: string | null
  location: string | null
}

export const MOCK_EVENTS: EventRecord[] = [
  {
    id: 'e_sigma-chi',
    title: 'Sigma Chi Neon Oasis',
    host_name: 'Sigma Chi',
    venue_type: 'Rooftop',
    ticket_price_ga: 5,
    ticket_price_vip: 15,
    theme_tag: 'Electric',
    date_time: '2025-04-12T21:00:00.000Z',
    image: '/event-1.png',
    detail: 'A premium neon rooftop experience with exclusive bottle service and campus guest list.',
    location: 'Downtown High Point',
  },
  {
    id: 'e_village-tavern',
    title: 'The Village Tavern Opener',
    host_name: 'Village Tavern',
    venue_type: 'Bar',
    ticket_price_ga: 5,
    ticket_price_vip: 15,
    theme_tag: 'Low-key luxe',
    date_time: '2025-04-18T22:00:00.000Z',
    image: '/event-2.png',
    detail: 'College crowd energy with bass-heavy sets, specialty pours, and guest DJs all night.',
    location: 'The Village district',
  },
  {
    id: 'e_kappa-sig',
    title: 'Kappa Sig Dayglow',
    host_name: 'Kappa Sig',
    venue_type: 'Day party',
    ticket_price_ga: 5,
    ticket_price_vip: 15,
    theme_tag: 'Neon foam',
    date_time: '2025-04-20T14:00:00.000Z',
    image: '/event-3.png',
    detail: 'A daytime destination with glow paint, rooftop chill spaces and live DJ sets.',
    location: 'Eastside Park',
  },
]

function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    host_name: row.host_name,
    venue_type: row.venue_type,
    ticket_price_ga: row.ticket_price_ga,
    ticket_price_vip: row.ticket_price_vip,
    theme_tag: row.theme_tag ?? '',
    date_time: row.date_time,
    image: row.image ?? undefined,
    detail: row.detail ?? undefined,
    location: row.location ?? undefined,
  }
}

export async function getEvents(): Promise<{ events: EventRecord[]; source: 'supabase' | 'mock' }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id,title,host_name,venue_type,ticket_price_ga,ticket_price_vip,theme_tag,date_time,image,detail,location')
      .order('date_time', { ascending: true })

    if (error || !data?.length) {
      return { events: MOCK_EVENTS, source: 'mock' }
    }

    return { events: (data as EventRow[]).map(mapEventRow), source: 'supabase' }
  } catch {
    return { events: MOCK_EVENTS, source: 'mock' }
  }
}

export async function getSavedEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_events')
    .select('event_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? []).map((row) => row.event_id as string)
}

export async function getUserRsvps(userId: string): Promise<Record<string, RsvpStatus>> {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('event_id,status')
    .eq('user_id', userId)

  if (error) throw error

  return (data ?? []).reduce<Record<string, RsvpStatus>>((acc, row) => {
    acc[row.event_id as string] = row.status as RsvpStatus
    return acc
  }, {})
}

export async function getUserEventEngagement(userId: string): Promise<UserEventEngagement> {
  const [savedEventIds, rsvps] = await Promise.all([
    getSavedEventIds(userId),
    getUserRsvps(userId),
  ])

  const attendedEventIds = Object.entries(rsvps)
    .filter(([, status]) => status === 'yes')
    .map(([eventId]) => eventId)

  return { savedEventIds, rsvps, attendedEventIds }
}

export async function saveEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_events')
    .insert({ user_id: userId, event_id: eventId })

  if (error) throw error
}

export async function unsaveEvent(userId: string, eventId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_events')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)

  if (error) throw error
}

export async function setRsvp(
  userId: string,
  eventId: string,
  status: RsvpStatus,
): Promise<void> {
  const { error } = await supabase
    .from('event_rsvps')
    .upsert(
      { user_id: userId, event_id: eventId, status, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,event_id' },
    )

  if (error) throw error
}
