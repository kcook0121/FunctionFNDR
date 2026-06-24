"use client"

import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react'
import Image from 'next/image'
import {
  Flame,
  Search,
  Layers,
  Navigation,
  Eye,
  Clock,
  Ghost,
  Radio,
  X,
  Users,
  Play,
  Zap,
  Volume2,
} from 'lucide-react'
import { mapPins, stories, type MapPin } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Toast } from '@/components/toast'
import { useToast } from '@/lib/useToast'

/** Live Audio Snippet — animated waveform simulating ambient club volume */
function LiveAudioSnippet() {
  const bars = [0.5, 0.8, 0.4, 1, 0.65, 0.9, 0.55, 0.75, 1, 0.45, 0.85, 0.6, 0.95, 0.5, 0.7, 0.4]
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Volume2 className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Live Audio Snippet</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Ambient · live
          </span>
        </div>
        <div className="mt-2 flex h-7 items-center gap-[3px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-1 origin-center rounded-full bg-primary/80"
              style={{
                height: `${h * 100}%`,
                animation: `wave-bar ${0.6 + (i % 5) * 0.14}s ease-in-out ${i * 0.05}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function heatRing(heat: MapPin['heat']) {
  switch (heat) {
    case 'hot':
      return 'ring-primary glow-lime'
    case 'warm':
      return 'ring-primary/60 glow-lime-soft'
    default:
      return 'ring-border'
  }
}

function vibeScore(heat: MapPin['heat']) {
  switch (heat) {
    case 'hot':
      return 92
    case 'warm':
      return 64
    default:
      return 28
  }
}

export function VibeMap() {
  const [selected, setSelected] = useState<MapPin | null>(null)
  const [broadcasting, setBroadcasting] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [savedPlaces, setSavedPlaces] = useState<string[]>([])
  const { toast, showToast } = useToast()

  const filterOptions = [
    'Tonight',
    'Free',
    'Near Me',
    'Hip-Hop',
    'House',
    'Greek Life',
    '18+',
    'Verified',
  ] as const

  const filteredPins = useMemo(() => {
    if (activeFilters.length === 0) return mapPins
    return mapPins.filter((pin) =>
      activeFilters.some((filter) => {
        if (filter === 'Tonight') return pin.heat !== 'cool'
        if (filter === 'Free') return pin.cover === 'Free'
        if (filter === 'Near Me') return pin.distance.startsWith('0.')
        if (filter === 'Hip-Hop') return pin.music.includes('Hip-Hop')
        if (filter === 'House') return pin.music.includes('House')
        if (filter === 'Greek Life') return pin.type === 'Frat'
        if (filter === '18+') return pin.cover !== 'Free'
        if (filter === 'Verified') return pin.verified
        return false
      }),
    )
  }, [activeFilters])

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    pointerRef.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging || !pointerRef.current) return
    const dx = event.clientX - pointerRef.current.x
    const dy = event.clientY - pointerRef.current.y
    setOffset((current) => ({
      x: Math.min(140, Math.max(-140, current.x + dx)),
      y: Math.min(140, Math.max(-140, current.y + dy)),
    }))
    pointerRef.current = { x: event.clientX, y: event.clientY }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    setDragging(false)
    pointerRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handlePointerCancel() {
    setDragging(false)
    pointerRef.current = null
  }

  function handlePointerLeave() {
    if (dragging) {
      setDragging(false)
      pointerRef.current = null
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.15 : 0.15
    setZoom((current) => Math.min(2, Math.max(0.8, current + delta)))
  }

  function toggleFilter(filter: string) {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((value) => value !== filter) : [...current, filter],
    )
  }

  function toggleSavedPlace(id: string) {
    setSavedPlaces((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
      showToast(next.includes(id) ? 'Saved to favorites' : 'Removed from saved')
      return next
    })
  }

  function sharePlace(name: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${name} · functionfndr.app`).catch(() => undefined)
    }
    showToast('Link copied to clipboard')
  }

  function setZoomLevel(delta: number) {
    setZoom((current) => Math.min(2, Math.max(0.8, current + delta)))
  }

  const selectedStory = selected
    ? stories.find((s) => s.venue === selected.name) ?? stories[0]
    : null
  const score = selected ? vibeScore(selected.heat) : 0
  const gaugeCirc = 2 * Math.PI * 36
  const gaugeDash = Math.round((score / 100) * gaugeCirc)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // Canvas setup for dark monochrome vector map simulation with subtle grid.
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    function resize() {
      const c = canvas! // non-null assertion for closure scope
      c.width = c.clientWidth * devicePixelRatio
      c.height = c.clientHeight * devicePixelRatio
      ctx?.scale(devicePixelRatio, devicePixelRatio)
      
      if (ctx) {
        // Dark monochrome base (Midnight Obsidian)
        ctx.fillStyle = '#15151a'
        ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
        
        // Subtle grid lines for vector map appearance
        ctx.strokeStyle = 'rgba(57,255,20,0.06)'
        ctx.lineWidth = 0.5
        const gridSize = 48
        for (let x = 0; x < c.clientWidth; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, c.clientHeight)
          ctx.stroke()
        }
        for (let y = 0; y < c.clientHeight; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(c.clientWidth, y)
          ctx.stroke()
        }
        
        // Subtle terrain/topography effect with soft radial gradients
        const grad1 = ctx.createRadialGradient(c.clientWidth * 0.25, c.clientHeight * 0.35, 0, c.clientWidth * 0.25, c.clientHeight * 0.35, c.clientWidth * 0.6)
        grad1.addColorStop(0, 'rgba(57,255,20,0.08)')
        grad1.addColorStop(1, 'rgba(57,255,20,0)')
        ctx.fillStyle = grad1
        ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
        
        const grad2 = ctx.createRadialGradient(c.clientWidth * 0.75, c.clientHeight * 0.65, 0, c.clientWidth * 0.75, c.clientHeight * 0.65, c.clientWidth * 0.5)
        grad2.addColorStop(0, 'rgba(57,255,20,0.06)')
        grad2.addColorStop(1, 'rgba(57,255,20,0)')
        ctx.fillStyle = grad2
        ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Interactive Map Viewport Container — dark monochrome vector map with grid */}
      <div className="absolute inset-0 bg-[#15151a] pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(28,27,34,0.10), rgba(13,13,17,0.2))' }} />
        <div className="absolute left-10 top-24 h-48 w-48 rounded-full bg-[#39ff14]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-44 h-56 w-56 rounded-full bg-[#39ff14]/08 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-28 h-40 w-40 rounded-full bg-[#39ff14]/08 blur-3xl pointer-events-none" />
      </div>

      {/* Map Pins — positioned within viewport bounds */}
      <div
        className={cn(
          'absolute inset-0 z-10 overflow-hidden touch-none',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
          transformOrigin: 'center center',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
      >
        {filteredPins.map((pin) => {
          const isActive = selected?.id === pin.id
          return (
            <button
              key={pin.id}
              onClick={() => setSelected(pin)}
              style={{ top: pin.top, left: pin.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition active:scale-95"
            >
              <div className="relative flex flex-col items-center">
                {pin.heat === 'hot' && (
                  <span className="absolute -z-10 h-20 w-20 rounded-full" style={{ boxShadow: '0 0 22px 6px rgba(57,255,20,0.08)' }} />
                )}
                <span
                  className={cn(
                    'relative flex h-14 w-14 items-center justify-center overflow-visible rounded-full ring-2 transition-all',
                    heatRing(pin.heat),
                    isActive && 'scale-110',
                  )}
                >
                  {/* inner pulse ring */}
                  <span className="absolute -inset-1 flex items-center justify-center">
                    <span className="h-10 w-10 rounded-full opacity-60" style={{ boxShadow: '0 0 12px 2px rgba(57,255,20,0.18)', border: '1px solid rgba(57,255,20,0.06)' }} />
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-[rgba(57,255,20,0.08)]" />
                  </span>
                  <Image
                    src={pin.avatar || '/placeholder.svg'}
                    alt={pin.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </span>
                {/* Vibe-check meter */}
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    pin.heat === 'hot'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/90 text-foreground backdrop-blur',
                  )}
                >
                  <Flame className="h-3 w-3" />
                  {pin.crowd}+
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Floating UI Overlays — fixed positioning on top of map */}
      {/* Live count badge — top-left (smaller, moved slightly down on mobile) */}
      <div className="absolute left-4 top-12 z-20 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-card/90 px-2 py-1 text-xs sm:px-3 sm:py-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-extrabold tracking-tight text-foreground">
            1,242 Out Tonight
          </p>
          <p className="text-[10px] font-medium text-muted-foreground">
            HPU students live now
          </p>
        </div>
      </div>

      {/* Grouped floating control buttons — right-side (moved lower to avoid overlap) */}
      <div className="absolute right-5 top-[132px] z-50 flex flex-col gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur transition active:scale-90">
          <Layers className="h-[18px] w-[18px]" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-primary backdrop-blur transition active:scale-90">
          <Navigation className="h-[18px] w-[18px]" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-transparent transition" aria-hidden>
          <Zap className="h-6 w-6 text-[rgba(57,255,20,0.95)] animate-pulse" />
        </button>
      </div>

      {/* Floating translucent search bar */}
      <div className="absolute left-4 right-24 top-[132px] z-20">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-3.5 py-3 backdrop-blur-md">
          <Search className="h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find lines, parties, or friends..."
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="absolute left-4 right-24 top-[205px] z-20">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((filter) => {
            const active = activeFilters.includes(filter)
            return (
              <button
                key={filter}
                type="button"
                onClick={() => toggleFilter(filter)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-semibold transition-all duration-200',
                  active
                    ? 'border-primary bg-primary/15 text-primary glow-lime-soft'
                    : 'border-border bg-card/80 text-muted-foreground hover:border-primary/50',
                )}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Zoom controls and filter summary (moved down on mobile to avoid header overlap) */}
      <div className="absolute right-5 top-[310px] z-30 flex flex-col items-center gap-3">
        <div className="rounded-3xl border border-border bg-card/80 p-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Live Vibe</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{filteredPins.length} spots</p>
        </div>
        <div className="rounded-3xl border border-border bg-card/80 p-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoomLevel(0.25)}
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(-0.25)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary"
          >
            −
          </button>
        </div>
      </div>

      {/* Floating Share Location toggle — bottom center, above nav */}
      {!selected && (
        <div className="absolute inset-x-0 bottom-28 z-20 flex justify-center">
          <button
            type="button"
            onClick={() => setBroadcasting((v) => !v)}
            aria-pressed={broadcasting}
            className={cn(
              'flex items-center gap-3 rounded-full border px-2 py-2 pr-5 backdrop-blur-md transition-all duration-300 active:scale-95',
              broadcasting
                ? 'border-primary/60 bg-primary/15 glow-lime-soft'
                : 'border-border bg-card/85',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
                broadcasting
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              {broadcasting ? (
                <Radio className="h-4.5 w-4.5" />
              ) : (
                <Ghost className="h-4.5 w-4.5" />
              )}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-bold text-foreground">
                {broadcasting ? 'Live Broadcast' : 'Ghost Mode'}
              </span>
              <span className="block text-[10px] font-medium text-muted-foreground">
                {broadcasting ? 'Friends can see you out' : 'You are invisible'}
              </span>
            </span>
            <span
              className={cn(
                'relative ml-1 h-6 w-11 rounded-full transition-colors duration-300',
                broadcasting ? 'bg-primary' : 'bg-secondary',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all duration-300',
                  broadcasting ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </span>
          </button>
        </div>
      )}

      {toast && <Toast message={toast} />}

      {/* Slide-up venue preview card */}
      {selected && selectedStory && (
        <>
          <button
            aria-label="Close preview"
            onClick={() => setSelected(null)}
            className="absolute inset-0 z-30 bg-background/40 backdrop-blur-[2px]"
          />
          <section className="absolute inset-x-0 bottom-0 z-40 rounded-t-[24px] border-t border-border bg-card pb-24 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.7)] animate-sheet-up">
            <div className="flex flex-col items-center pt-3">
              <span className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
            </div>

            {/* 10s looping video snippet */}
            <div className="relative mx-4 mt-3 aspect-[16/10] overflow-hidden rounded-2xl border border-border">
              <Image
                src={selectedStory.thumb || '/placeholder.svg'}
                alt={`Live crowd at ${selected.name}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
              {/* play / loop indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur">
                  <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                </span>
              </div>
              <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                LIVE · 0:10 loop
              </div>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                <Eye className="h-3 w-3" />
                {selectedStory.viewers}
              </div>
              {/* progress loop bar */}
              <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-background/50">
                <span className="block h-full w-2/3 rounded-full bg-primary" />
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Venue meta */}
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                    {selected.name}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground">
                    {selected.type} · {selected.crowd} people inside
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {selectedStory.wait}
                </span>
              </div>

              {/* Vibe Meter radial gauge + audio snippet */}
              <div className="mt-4 grid grid-cols-[80px_1fr] items-center gap-4 rounded-2xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-center">
                  <svg width="84" height="84" viewBox="0 0 84 84" className="">
                    <circle cx="42" cy="42" r="36" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />
                    <circle
                      cx="42"
                      cy="42"
                      r="36"
                      stroke="#39FF14"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${gaugeDash} ${gaugeCirc}`}
                      transform="rotate(-90 42 42)"
                      style={{ transition: 'stroke-dasharray 500ms ease' }}
                    />
                    <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontWeight={700} fontSize={14} fill="#FFFFFF">{score}</text>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Flame className="h-4 w-4 text-primary" />
                      Vibe Meter
                    </span>
                    <span className="text-sm font-extrabold text-primary">{score}/100</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                    {score > 80
                      ? 'Packed and peaking — get there now.'
                      : score > 50
                        ? 'Filling up fast, solid energy.'
                        : 'Still early, building up.'}
                  </p>
                  <LiveAudioSnippet />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Ticket request sent')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition active:scale-95"
              >
                <Users className="h-4 w-4" />
                Get Ticket
              </button>
              <button
                type="button"
                onClick={() => toggleSavedPlace(selected.id)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background py-3.5 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                {savedPlaces.includes(selected.id) ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => sharePlace(selected.name)}
                className="rounded-full border border-border bg-card/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => showToast('Directions opened')}
                className="rounded-full border border-border bg-card/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary"
              >
                Directions
              </button>
            </div>
          </div>
        </section>
        </>
      )}
    </div>
  )
}
