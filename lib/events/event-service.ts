import { supabase } from '@/lib/supabaseClient'

export type RsvpStatus = 'yes' | 'maybe' | 'no'

export type EventRecord = {
  id: string
  title: string
  host_id?: string
  host_name: string
  university?: string
  venue_type: string
  address?: string
  ticket_price_ga: number
  ticket_price_vip: number
  theme_tag: string
  music_genre?: string
  date_time: string
  end_time?: string
  capacity?: number
  image?: string
  detail?: string
  location?: string
}

export type CreateEventInput = {
  title: string
  university: string
  venue: string
  address: string
  date: string
  startTime: string
  endTime: string
  coverPrice: number
  capacity: number
  musicGenre: string
  description: string
  imageUrl?: string
}

export type UserEventEngagement = {
  savedEventIds: string[]
  rsvps: Record<string, RsvpStatus>
  attendedEventIds: string[]
}

export type MyEventsGroups = {
  created: EventRecord[]
  saved: EventRecord[]
  going: EventRecord[]
  interested: EventRecord[]
}

type EventRow = {
  id: string
  title: string
  host_id: string | null
  host_name: string
  university: string | null
  venue_type: string
  address: string | null
  ticket_price_ga: number
  ticket_price_vip: number
  theme_tag: string | null
  music_genre: string | null
  date_time: string
  end_time: string | null
  capacity: number | null
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
    host_id: row.host_id ?? undefined,
    host_name: row.host_name,
    university: row.university ?? undefined,
    venue_type: row.venue_type,
    address: row.address ?? row.location ?? undefined,
    ticket_price_ga: row.ticket_price_ga,
    ticket_price_vip: row.ticket_price_vip,
    theme_tag: row.theme_tag ?? row.music_genre ?? '',
    music_genre: row.music_genre ?? row.theme_tag ?? undefined,
    date_time: row.date_time,
    end_time: row.end_time ?? undefined,
    capacity: row.capacity ?? undefined,
    image: row.image ?? undefined,
    detail: row.detail ?? undefined,
    location: row.location ?? row.address ?? undefined,
  }
}

function generateEventId(): string {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `e_${Date.now()}_${suffix}`
}

function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString()
}

const EVENT_SELECT_FIELDS =
  'id,title,host_id,host_name,university,venue_type,address,ticket_price_ga,ticket_price_vip,theme_tag,music_genre,date_time,end_time,capacity,image,detail,location'

export async function getEvents(): Promise<{ events: EventRecord[]; source: 'supabase' | 'mock' }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_SELECT_FIELDS)
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

export async function createEvent(
  userId: string,
  hostName: string,
  input: CreateEventInput,
): Promise<EventRecord> {
  const id = generateEventId()
  const dateTime = combineDateAndTime(input.date, input.startTime)
  const endTime = combineDateAndTime(input.date, input.endTime)
  const vipPrice = Math.max(input.coverPrice * 3, input.coverPrice + 10)

  const payload = {
    id,
    title: input.title.trim(),
    host_id: userId,
    host_name: hostName.trim() || 'Campus Host',
    university: input.university.trim(),
    venue_type: input.venue.trim(),
    address: input.address.trim(),
    location: input.address.trim(),
    ticket_price_ga: input.coverPrice,
    ticket_price_vip: vipPrice,
    theme_tag: input.musicGenre.trim(),
    music_genre: input.musicGenre.trim(),
    date_time: dateTime,
    end_time: endTime,
    capacity: input.capacity,
    image: input.imageUrl?.trim() || '/event-1.png',
    detail: input.description.trim(),
  }

  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select(EVENT_SELECT_FIELDS)
    .single()

  if (error) throw error
  return mapEventRow(data as EventRow)
}

function mapJoinedEvents(rows: Array<{ events: EventRow | EventRow[] | null }>): EventRecord[] {
  return rows
    .map((row) => {
      const event = Array.isArray(row.events) ? row.events[0] : row.events
      return event ? mapEventRow(event) : null
    })
    .filter((event): event is EventRecord => event !== null)
}

async function getCreatedEvents(userId: string): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT_FIELDS)
    .eq('host_id', userId)
    .order('date_time', { ascending: true })

  if (error) throw error
  return (data as EventRow[]).map(mapEventRow)
}

async function getSavedEventsForUser(userId: string): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from('saved_events')
    .select(`created_at, events (${EVENT_SELECT_FIELDS})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return mapJoinedEvents((data ?? []) as Array<{ events: EventRow | EventRow[] | null }>)
}

async function getRsvpEventsForUser(userId: string, status: RsvpStatus): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select(`updated_at, events (${EVENT_SELECT_FIELDS})`)
    .eq('user_id', userId)
    .eq('status', status)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return mapJoinedEvents((data ?? []) as Array<{ events: EventRow | EventRow[] | null }>)
}

function buildMockMyEvents(
  userId: string,
  engagement: UserEventEngagement,
): MyEventsGroups {
  const eventsById = new Map(MOCK_EVENTS.map((event) => [event.id, event]))
  const pick = (ids: string[]) =>
    ids
      .map((id) => eventsById.get(id))
      .filter((event): event is EventRecord => Boolean(event))

  const goingIds = Object.entries(engagement.rsvps)
    .filter(([, status]) => status === 'yes')
    .map(([eventId]) => eventId)
  const interestedIds = Object.entries(engagement.rsvps)
    .filter(([, status]) => status === 'maybe')
    .map(([eventId]) => eventId)

  return {
    created: MOCK_EVENTS.filter((event) => event.host_id === userId),
    saved: pick(engagement.savedEventIds),
    going: pick(goingIds),
    interested: pick(interestedIds),
  }
}

export async function getMyEvents(
  userId: string,
): Promise<{ groups: MyEventsGroups; source: 'supabase' | 'mock' }> {
  try {
    const [created, saved, going, interested] = await Promise.all([
      getCreatedEvents(userId),
      getSavedEventsForUser(userId),
      getRsvpEventsForUser(userId, 'yes'),
      getRsvpEventsForUser(userId, 'maybe'),
    ])

    return {
      groups: { created, saved, going, interested },
      source: 'supabase',
    }
  } catch {
    let engagement: UserEventEngagement = {
      savedEventIds: [],
      rsvps: {},
      attendedEventIds: [],
    }

    try {
      engagement = await getUserEventEngagement(userId)
    } catch {
      // Use empty engagement when Supabase is unavailable.
    }

    return {
      groups: buildMockMyEvents(userId, engagement),
      source: 'mock',
    }
  }
}
