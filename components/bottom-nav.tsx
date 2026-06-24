'use client'

import { MapPinned, Ticket, Disc3, Wallet, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'map' | 'gate' | 'create' | 'sound' | 'earn'

const items: { id: Tab; label: string; icon: typeof MapPinned }[] = [
  { id: 'map', label: 'VibeMap', icon: MapPinned },
  { id: 'gate', label: 'Tickets', icon: Ticket },
  { id: 'create', label: 'Create', icon: CalendarPlus },
  { id: 'sound', label: 'Soundstage', icon: Disc3 },
  { id: 'earn', label: 'Earn', icon: Wallet },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <ul className="flex items-stretch justify-around px-1.5 pb-6 pt-2.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="group flex w-full flex-col items-center gap-1 rounded-xl py-1.5 transition-transform active:scale-90"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-primary text-primary-foreground glow-lime'
                      : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold tracking-wide transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
