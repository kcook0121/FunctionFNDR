export type MapPin = {
  id: string
  name: string
  type: 'Frat' | 'Bar' | 'Lounge' | 'Pop-Up'
  avatar: string
  crowd: number
  heat: 'hot' | 'warm' | 'cool'
  // percentage positions over the map
  top: string
  left: string
  distance: string
  music: string
  cover: string
  capacity: string
  verified: boolean
  safe: boolean
  vibe: string
}

export const mapPins: MapPin[] = [
  {
    id: 'p1',
    name: 'Sig Ep House',
    type: 'Frat',
    avatar: '/venue-1.png',
    crowd: 250,
    heat: 'hot',
    top: '34%',
    left: '28%',
    distance: '0.7 mi',
    music: 'Hip-Hop • Bass',
    cover: '$10',
    capacity: '324 / 350',
    verified: true,
    safe: true,
    vibe: 'Neon rooftop takeover with campus crew.',
  },
  {
    id: 'p2',
    name: 'The Cellar',
    type: 'Bar',
    avatar: '/venue-2.png',
    crowd: 180,
    heat: 'hot',
    top: '52%',
    left: '62%',
    distance: '1.2 mi',
    music: 'House • Techno',
    cover: '$12',
    capacity: '198 / 220',
    verified: true,
    safe: true,
    vibe: 'Hidden basement with glow bottles and low lights.',
  },
  {
    id: 'p3',
    name: 'Skyline Lounge',
    type: 'Lounge',
    avatar: '/venue-3.png',
    crowd: 90,
    heat: 'warm',
    top: '24%',
    left: '68%',
    distance: '0.3 mi',
    music: 'R&B • Soul',
    cover: 'Free',
    capacity: '88 / 120',
    verified: true,
    safe: true,
    vibe: 'Chill rooftop lounge with curated sound and comfy seating.',
  },
  {
    id: 'p4',
    name: 'Main St. Tavern',
    type: 'Bar',
    avatar: '/venue-2.png',
    crowd: 40,
    heat: 'cool',
    top: '64%',
    left: '34%',
    distance: '2.1 mi',
    music: 'Greek Life • Pop',
    cover: '$5',
    capacity: '42 / 150',
    verified: false,
    safe: true,
    vibe: 'Campus pregame with local chapter energy.',
  },
]

export type Story = {
  id: string
  venue: string
  thumb: string
  viewers: number
  wait: string
}

export const stories: Story[] = [
  { id: 's1', venue: 'Sig Ep House', thumb: '/story-1.png', viewers: 312, wait: '5 min' },
  { id: 's2', venue: 'Skyline Lounge', thumb: '/story-2.png', viewers: 148, wait: 'No line' },
  { id: 's3', venue: 'The Cellar', thumb: '/story-3.png', viewers: 226, wait: '12 min' },
  { id: 's4', venue: 'Neon Oasis Pop-Up', thumb: '/story-4.png', viewers: 97, wait: '2 min' },
]

export type UserProfile = {
  id: string
  avatar: string
  name: string
  school: string
  year: string
  bio: string
  savedEvents: string[]
  attendedEvents: string[]
  musicPrefs: string[]
  promoterTier: 'Rookie' | 'Plug' | 'Campus Rep' | 'Headliner'
  verified: boolean
  referrals: number
  ticketsSold: number
  partiesPromoted: number
}

export const currentUser: UserProfile = {
  id: 'u1',
  avatar: '/user-avatar.png',
  name: 'Cassie Hart',
  school: 'High Point University',
  year: 'Class of 2027',
  bio: 'Campus connector, DJ guestlist curator, and weekend social director.',
  savedEvents: ['e_sigma-chi', 'e_village-tavern'],
  attendedEvents: ['e_kappa-sig'],
  musicPrefs: ['Hip-Hop', 'House', 'R&B'],
  promoterTier: 'Plug',
  verified: true,
  referrals: 18,
  ticketsSold: 52,
  partiesPromoted: 11,
}

export type Party = {
  id: string
  name: string
  host: string
  venue: string
  genre: string
  mood: string
  cover: string
  attendance: string
  image: string
  tags: string[]
}

export const parties: Party[] = [
  {
    id: 'party-1',
    name: 'Neon Oasis',
    host: 'DJ Re-Up',
    venue: 'Skyline Terrace',
    genre: 'Hip-Hop · R&B',
    mood: 'Glow | Chill | Upbeat',
    cover: '$12',
    attendance: '320 attendees',
    image: '/event-1.png',
    tags: ['Hip-Hop', 'Glow Night', 'Verified'],
  },
  {
    id: 'party-2',
    name: 'The Vault',
    host: 'City PR',
    venue: 'Cellar Lounge',
    genre: 'House · Techno',
    mood: 'Underground | Late Night',
    cover: '$15',
    attendance: '189 attendees',
    image: '/event-2.png',
    tags: ['House', 'Near Me', 'Verified'],
  },
  {
    id: 'party-3',
    name: 'Dayglow Bash',
    host: 'Kappa Sig',
    venue: 'Eastside Green',
    genre: 'Pop · Dance',
    mood: 'Day Party | Foam | Vibes',
    cover: 'Free',
    attendance: '94 attendees',
    image: '/event-3.png',
    tags: ['Free', 'Greek Life', 'Day Party'],
  },
]

export type Tier = {
  id: string
  name: string
  price: number
  note: string
  badge?: string
  soldOutPct?: number
}

export const tiers: Tier[] = [
  { id: 't_general', name: 'General Admission', price: 5, note: 'General Admission', soldOutPct: 48 },
  { id: 't_vip', name: 'VIP Line-Skip', price: 15, note: 'VIP line-skip access', badge: 'VIP', soldOutPct: 30 },
  { id: 't_greek', name: 'Greek Pass', price: 20, note: 'Verified chapters', soldOutPct: 60 },
  { id: 't_early', name: 'Early Bird', price: 10, note: 'Limited release', soldOutPct: 92 },
]

export type EventCard = {
  id: string
  name: string
  tagline: string
  host: string
  venue: string
  date: string
  time: string
  location: string
  image: string
  detail: string
  vibe: string
}

export const events: EventCard[] = [
  {
    id: 'e_sigma-chi',
    name: 'Sigma Chi Neon Oasis',
    tagline: 'VIP invite-only spring pregame',
    host: 'Sigma Chi',
    venue: 'Main Street Garden',
    date: 'Sat, Apr 12',
    time: '9:00 PM',
    location: 'Downtown High Point',
    image: '/event-1.png',
    detail: 'A premium neon rooftop experience with exclusive bottle service and campus guest list.',
    vibe: 'Electric. Elevated. Pack your crew.',
  },
  {
    id: 'e_village-tavern',
    name: 'The Village Tavern Opener',
    tagline: 'House party turned late-night takeover',
    host: 'Village Tavern',
    venue: 'Village Tavern',
    date: 'Fri, Apr 18',
    time: '10:00 PM',
    location: 'The Village district',
    image: '/event-2.png',
    detail: 'College crowd energy with bass-heavy sets, specialty pours, and guest DJs all night.',
    vibe: 'Low-key luxe with a hype after-dark crowd.',
  },
  {
    id: 'e_kappa-sig',
    name: 'Kappa Sig Dayglow',
    tagline: 'Day party meets neon foam bash',
    host: 'Kappa Sig',
    venue: 'City Park',
    date: 'Sun, Apr 20',
    time: '2:00 PM',
    location: 'Eastside Park',
    image: '/event-3.png',
    detail: 'A daytime destination with glow paint, rooftop chill spaces and live DJ sets.',
    vibe: 'Bright energy, bold visuals, and campus favorites.',
  },
]

export type Track = {
  id: string
  title: string
  artist: string
  art: string
  votes: number
  voted?: boolean
}

export const tracks: Track[] = [
  { id: 'tr1', title: 'Type Shit', artist: 'Future, Metro Boomin', art: '/album-1.png', votes: 342 },
  { id: 'tr2', title: 'Pump It Up', artist: 'Endor', art: '/album-2.png', votes: 287 },
  { id: 'tr3', title: 'Flowers', artist: 'Miley Cyrus', art: '/album-3.png', votes: 211 },
  { id: 'tr4', title: 'In Da Club', artist: '50 Cent', art: '/album-4.png', votes: 176 },
  { id: 'tr5', title: 'One Dance', artist: 'Drake', art: '/album-1.png', votes: 142 },
]

export type Brief = {
  id: string
  host: string
  logo: string
  title: string
  requirement: string
  payout: number
  platform: 'Instagram Story' | 'TikTok' | 'Instagram Post'
  spotsLeft: number
}

export const briefs: Brief[] = [
  {
    id: 'b1',
    host: 'The Cellar',
    logo: '/venue-2.png',
    title: 'Post Opening Night Flyer on IG Story',
    requirement: 'Must hit 100+ views · tag @thecellar_hpu',
    payout: 15,
    platform: 'Instagram Story',
    spotsLeft: 6,
  },
  {
    id: 'b2',
    host: 'Sig Ep House',
    logo: '/venue-1.png',
    title: 'TikTok dancing clip from the function',
    requirement: 'Must hit 500+ views · use #SigEpRager',
    payout: 25,
    platform: 'TikTok',
    spotsLeft: 3,
  },
  {
    id: 'b3',
    host: 'Skyline Lounge',
    logo: '/venue-3.png',
    title: 'Repost rooftop set lineup to your grid',
    requirement: 'Must hit 250+ views · keep up 24h',
    payout: 18,
    platform: 'Instagram Post',
    spotsLeft: 9,
  },
]

export type Cashout = {
  label: string
  amount: number
  status: 'Cleared' | 'Pending'
}

export const cashouts: Cashout[] = [
  { label: 'IG Story · The Cellar', amount: 15, status: 'Cleared' },
  { label: 'TikTok · Neon Oasis', amount: 25, status: 'Cleared' },
  { label: 'IG Post · Skyline', amount: 18, status: 'Pending' },
]
