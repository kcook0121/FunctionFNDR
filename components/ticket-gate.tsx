'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Bookmark, CalendarDays, Clock, MapPin, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useAuth } from '@/lib/auth/auth-context'
import { getEvents, type EventRecord } from '@/lib/events/event-service'
import { tiers } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Toast } from '@/components/toast'
import { useToast } from '@/lib/useToast'

export type VenueEvent = EventRecord

type CheckedOutTicket = {
  rawToken: string
  tierName: string
  hostName: string
  eventTitle: string
}

function formatEventDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

const RSVP_OPTIONS = [
  { status: 'yes' as const, label: 'Going' },
  { status: 'maybe' as const, label: 'Maybe' },
  { status: 'no' as const, label: 'Not going' },
]

export function TicketGate() {
  const { savedEventIds, rsvps, saveEvent, unsaveEvent, setRsvp } = useAuth()
  const [events, setEvents] = useState<VenueEvent[]>([])
  const [eventsSource, setEventsSource] = useState<'supabase' | 'mock'>('mock')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState('t_general')
  const [checkedOutTicket, setCheckedOutTicket] = useState<CheckedOutTicket | null>(null)
  const [isApplePaySheetOpen, setIsApplePaySheetOpen] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    async function loadEvents() {
      setIsLoadingEvents(true)
      try {
        const result = await getEvents()
        setEvents(result.events)
        setEventsSource(result.source)
        if (result.source === 'mock') {
          showToast('Could not load live events — showing sample lineup')
        }
      } catch (err) {
        console.warn('Unexpected error loading events:', err)
        showToast('Could not load live events — showing sample lineup')
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [showToast])

  const displayEvents = events.length > 0 ? events : []
  const selectedEvent = useMemo(
    () => displayEvents.find((event) => event.id === selectedEventId) ?? displayEvents[0] ?? null,
    [displayEvents, selectedEventId],
  )

  const selectedTier = tiers.find((tier) => tier.id === selectedTierId) ?? tiers[0]
  const selectedTicketPrice = selectedEvent
    ? selectedTierId === 't_general'
      ? selectedEvent.ticket_price_ga
      : selectedEvent.ticket_price_vip
    : 0
  const selectedEventDateTime = selectedEvent ? formatEventDateTime(selectedEvent.date_time) : { date: '', time: '' }

  function openDrawer(eventId: string) {
    setSelectedEventId(eventId)
    setSelectedTierId('t_general')
    setCheckedOutTicket(null)
    setIsApplePaySheetOpen(false)
    setIsDrawerOpen(true)
  }

  function generateTicketToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 12 }, () => characters[Math.floor(Math.random() * characters.length)]).join('')
  }

  function handleCheckout() {
    if (!selectedEvent) return

    const rawToken = generateTicketToken()
    setCheckedOutTicket({
      rawToken,
      tierName: selectedTier.name,
      hostName: selectedEvent.host_name,
      eventTitle: selectedEvent.title,
    })
  }

  function handleAppleWallet() {
    if (!checkedOutTicket) return

    if (typeof window !== 'undefined') {
      window.location.href = `/api/wallet?token=${checkedOutTicket.rawToken}&event=${encodeURIComponent(
        checkedOutTicket.eventTitle,
      )}&host=${encodeURIComponent(checkedOutTicket.hostName)}`
    }
  }

  function openApplePaySheet() {
    if (!selectedEvent) return
    setIsApplePaySheetOpen(true)
  }

  function closeApplePaySheet() {
    setIsApplePaySheetOpen(false)
  }

  function completeApplePay() {
    setIsApplePaySheetOpen(false)
    handleCheckout()
    showToast('Checkout completed')
  }

  function handleSheetDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.y > 100) {
      closeDrawer()
    }
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setIsApplePaySheetOpen(false)
  }

  async function toggleSave(eventId: string) {
    const isSaved = savedEventIds.includes(eventId)
    const result = isSaved ? await unsaveEvent(eventId) : await saveEvent(eventId)
    if (result.error) {
      showToast(result.error)
      return
    }
    showToast(isSaved ? 'Removed from saved' : 'Saved to your profile')
  }

  async function handleRsvp(eventId: string, status: 'yes' | 'maybe' | 'no') {
    const result = await setRsvp(eventId, status)
    if (result.error) {
      showToast(result.error)
      return
    }
    const label = RSVP_OPTIONS.find((option) => option.status === status)?.label ?? status
    showToast(`RSVP updated: ${label}`)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="no-scrollbar h-full overflow-y-auto pb-32">
        <div className="px-4 pt-5">
          <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            Tickets
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            HPU event access
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Browse premium High Point events, save your picks, and RSVP before checkout.
          </p>
          {eventsSource === 'mock' && !isLoadingEvents && (
            <p className="mt-3 rounded-2xl border border-[#2C2B35] bg-[#121217] px-3 py-2 text-[11px] text-muted-foreground">
              Showing sample lineup until Supabase events are configured.
            </p>
          )}
        </div>

        <div className="mt-5 space-y-4 px-4 pb-10">
          {isLoadingEvents && (
            <div className="rounded-3xl border border-[#2C2B35] bg-[#121217] p-4 text-sm text-muted-foreground">
              Loading events...
            </div>
          )}
          {displayEvents.map((event) => {
            const { date, time } = formatEventDateTime(event.date_time)
            const isSaved = savedEventIds.includes(event.id)
            const rsvpStatus = rsvps[event.id]
            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-[32px] border border-[#2C2B35] bg-[#1C1B22] transition-all duration-300 ease-in-out hover:border-primary/40 hover:shadow-[0_0_18px_rgba(57,255,20,0.15)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={event.image ?? '/event-1.png'}
                    alt={event.title}
                    fill
                    className="object-cover transition duration-300 ease-in-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11]/95 via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.34em] text-primary">
                        {event.host_name}
                      </p>
                      <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground">
                        {event.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">{event.detail ?? ''}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-[#0f0f14]/80 px-3 py-1 text-[11px] font-semibold text-primary">
                          GA ${event.ticket_price_ga}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-[#0f0f14]/80 px-3 py-1 text-[11px] font-semibold text-primary">
                          {event.theme_tag}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleSave(event.id)}
                        aria-label={isSaved ? 'Remove saved event' : 'Save event'}
                        className={cn(
                          'rounded-full border p-2 transition-all duration-300 ease-in-out',
                          isSaved
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-[#2C2B35] bg-[#0f0f14]/80 text-foreground hover:border-primary/40',
                        )}
                      >
                        <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDrawer(event.id)}
                        className="rounded-full bg-[#39FF14] px-4 py-2 text-xs font-extrabold tracking-tight text-black transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(57,255,20,0.24)]"
                      >
                        RSVP NOW
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 px-4 pb-5 pt-4">
                  {rsvpStatus && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                      RSVP: {RSVP_OPTIONS.find((option) => option.status === rsvpStatus)?.label ?? rsvpStatus}
                    </p>
                  )}
                  <div className="grid gap-2 text-[11px] font-semibold tracking-tight text-muted-foreground sm:grid-cols-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2B35] px-3 py-2">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {date}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2B35] px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {time}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#2C2B35] px-3 py-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {event.venue_type}
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-foreground">{event.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isDrawerOpen && selectedEvent && (
          <>
            <div className="absolute inset-0 z-50">
              <div
                className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                onClick={closeDrawer}
              />
              <motion.div
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={handleSheetDragEnd}
                initial={{ y: 260 }}
                animate={{ y: 0 }}
                exit={{ y: 500, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                className="absolute inset-x-0 bottom-0 rounded-t-[36px] border-t border-[#2C2B35] bg-[#1C1B22] px-4 pb-8 pt-5 shadow-[0_-25px_60px_-20px_rgba(0,0,0,0.7)] animate-modal-up"
              >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-muted-foreground/30" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                    Checkout
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
                    {selectedEvent.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedEvent.host_name} · {selectedEvent.venue_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-[#2C2B35] bg-[#0d0d11] p-2 text-muted-foreground transition-all duration-300 ease-in-out hover:border-primary/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {checkedOutTicket ? (
                <div className="mt-5 rounded-[32px] border border-[#2C2B35] bg-[#0b0b10]/95 p-5 text-center shadow-[0_0_30px_rgba(57,255,20,0.12)]">
                  <div className="inline-flex items-center justify-center rounded-full bg-[#111214] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-300 shadow-[0_0_18px_rgba(57,255,20,0.12)]">
                    Confirmed · Secure Ticket
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-primary mt-4">
                    Ticket Voucher
                  </p>
                  <h3 className="mt-3 text-xl font-extrabold tracking-tight text-foreground">
                    {checkedOutTicket.eventTitle}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {checkedOutTicket.hostName} · {checkedOutTicket.tierName}
                  </p>

                  <div className="mx-auto mt-6 w-[240px] rounded-[32px] bg-[#1C1B22] p-4 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <div className="mx-auto rounded-3xl bg-white p-3">
                      <QRCodeSVG
                        value={checkedOutTicket.rawToken}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="Q"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Scan this code at the door
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-foreground">
                    {checkedOutTicket.rawToken}
                  </p>

                  <button
                    type="button"
                    onClick={handleAppleWallet}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-4 text-sm font-extrabold tracking-tight text-white transition-all duration-300 ease-in-out hover:bg-neutral-900"
                  >
                    Add to Apple Wallet
                  </button>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {selectedEvent.detail}
                  </p>

                  <div className="mt-5 rounded-[28px] border border-[#2C2B35] bg-[#131217] p-4">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                      Your RSVP
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {RSVP_OPTIONS.map((option) => {
                        const isActive = rsvps[selectedEvent.id] === option.status
                        return (
                          <button
                            key={option.status}
                            type="button"
                            onClick={() => void handleRsvp(selectedEvent.id, option.status)}
                            className={cn(
                              'rounded-2xl border px-3 py-3 text-xs font-bold transition-all duration-300 ease-in-out',
                              isActive
                                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(57,255,20,0.12)]'
                                : 'border-[#2C2B35] bg-[#0d0d11] text-foreground hover:border-primary/40',
                            )}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {tiers.slice(0, 2).map((tier) => {
                      const isActive = selectedTierId === tier.id
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedTierId(tier.id)}
                          className={cn(
                            'flex items-center justify-between rounded-[28px] border px-4 py-4 text-left transition-all duration-300 ease-in-out',
                            isActive
                              ? 'border-primary bg-[#15151a] shadow-[0_0_15px_rgba(57,255,20,0.18)]'
                              : 'border-[#2C2B35] bg-[#131217] hover:border-primary/40',
                          )}
                        >
                          <div>
                            <p className="text-sm font-bold tracking-tight text-foreground">
                              {tier.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {tier.note}
                            </p>
                          </div>
                          <span className="text-base font-extrabold text-foreground">
                            ${tier.price}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[28px] border border-[#2C2B35] bg-[#0d0d11]">
                    <div className="relative h-24 bg-[url('/venue-banner.png')] bg-cover bg-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11]/95 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                            Apple Wallet
                          </p>
                          <p className="mt-1 text-lg font-extrabold tracking-tight text-foreground">
                            {selectedTier.name}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#39FF14] px-3 py-1 text-[11px] font-bold text-black">
                          FunctionFNDR
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#2C2B35] bg-[#12121b] px-4 py-3 text-[11px] text-muted-foreground">
                      <span>{selectedEventDateTime.date} · {selectedEventDateTime.time}</span>
                      <div className="flex h-5 items-end gap-[2px]">
                        {Array.from({ length: 18 }).map((_, index) => (
                          <span
                            key={index}
                            className="w-0.5 bg-foreground"
                            style={{ height: `${(index % 3) * 16 + 28}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#2C2B35] pt-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-extrabold text-foreground">
                      ${selectedTicketPrice}.00
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      openApplePaySheet()
                      showToast('Opening Apple Pay sheet')
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-black px-4 py-4 text-sm font-extrabold tracking-tight text-white transition-all duration-300 ease-in-out shadow-[0_0_12px_rgba(0,0,0,0.2)] hover:bg-neutral-900"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-white text-[11px] font-black text-black">
                      
                    </span>
                    <span>Pay with Apple Pay</span>
                  </button>
                  <p className="mt-2 text-center text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                    Secure checkout with Apple Pay
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
      </AnimatePresence>

      {isApplePaySheetOpen && (
            <div className="absolute inset-0 z-60 flex items-end justify-center bg-black/60 px-4 pb-6 pt-10">
              <div className="w-full max-w-md rounded-t-[36px] bg-[#141418] p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-modal-up">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Apple Pay</p>
                    <h3 className="text-xl font-extrabold tracking-tight text-white">Double-Click to Pay</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeApplePaySheet}
                    className="rounded-full border border-[#2C2B35] bg-[#0d0d11] p-2 text-muted-foreground hover:border-primary/40"
                  >
                    Close
                  </button>
                </div>
                <div className="rounded-[28px] border border-[#2C2B35] bg-[#0d0d11] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Payment</span>
                    <span className="rounded-full bg-[#1c1b22] px-3 py-1 text-[11px] uppercase text-muted-foreground">Apple Card</span>
                  </div>
                  <div className="mb-4 space-y-2 text-left">
                    <p className="text-sm text-muted-foreground">{selectedEvent.title}</p>
                    <p className="text-lg font-bold text-white">{selectedEvent.host_name}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] bg-[#141418] px-4 py-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-extrabold text-white">${selectedTicketPrice}.00</span>
                  </div>
                </div>
                <div className="mt-5 rounded-[28px] bg-[#0d0d11] p-4 text-center text-sm text-muted-foreground">
                  Confirm your purchase with Face ID or Touch ID by double-clicking the side button.
                </div>
                <button
                  type="button"
                  onClick={completeApplePay}
                  className="mt-5 w-full rounded-full bg-white px-4 py-4 text-sm font-extrabold text-black transition-all duration-300 ease-in-out hover:bg-neutral-200"
                >
                  Simulate Pay
                </button>
              </div>
            </div>
          )}
      {toast && <Toast message={toast} />}
    </div>
  )
}
