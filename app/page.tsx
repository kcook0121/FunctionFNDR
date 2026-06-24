'use client'

import { useState } from 'react'
import { AuthGate } from '@/components/auth/auth-gate'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { CreateEvent } from '@/components/create-event'
import { ProfileSummary } from '@/components/profile'
import { VibeMap } from '@/components/vibe-map'
import { TicketGate } from '@/components/ticket-gate'
import { Soundstage } from '../components/soundstage'
import { Earn } from '@/components/earn'

export default function Page() {
  const [tab, setTab] = useState<Tab>('map')
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0)

  function handleEventCreated() {
    setEventsRefreshKey((current) => current + 1)
    setTab('gate')
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-0 sm:p-6">
      {/* Phone shell */}
      <div className="relative h-[100dvh] w-full overflow-hidden bg-background sm:h-[860px] sm:max-w-[420px] sm:rounded-[44px] sm:border sm:border-border sm:shadow-[0_30px_120px_-20px_rgba(57,255,20,0.18)]">
        <div className="relative h-full w-full overflow-hidden sm:rounded-[44px]">
          <AuthGate>
            <div className="absolute right-4 top-4 z-30">
              <ProfileSummary />
            </div>
            {tab === 'map' && <VibeMap />}
            {tab === 'gate' && <TicketGate refreshKey={eventsRefreshKey} />}
            {tab === 'create' && <CreateEvent onCreated={handleEventCreated} />}
            {tab === 'sound' && <Soundstage />}
            {tab === 'earn' && <Earn />}
            <BottomNav active={tab} onChange={setTab} />
          </AuthGate>
        </div>
      </div>
    </main>
  )
}
