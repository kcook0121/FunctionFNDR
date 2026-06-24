'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowUpRight,
  TrendingUp,
  UploadCloud,
  CheckCircle2,
  Clock3,
  Camera,
  Music2,
  Users,
} from 'lucide-react'
import { briefs, cashouts, type Brief } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Toast } from '@/components/toast'
import { useToast } from '@/lib/useToast'

function platformIcon(p: Brief['platform']) {
  return p === 'TikTok' ? Music2 : Camera
}

export function Earn() {
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast, showToast } = useToast()

  function handleFiles(files: FileList | null, id: string) {
    if (!files || files.length === 0) return
    setUploading(true)
    // simulate upload + processing
    setTimeout(() => {
      setSubmitted((s) => ({ ...s, [id]: true }))
      setUploading(false)
      setDragOver(false)
      showToast('Submission uploaded')
    }, 1400)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        {/* Header */}
        <header className="px-4 pt-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Promoter Hub</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Earn
              </h1>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-card px-2.5 py-1 text-[11px] font-bold text-primary">
              <Users className="h-3.5 w-3.5" />
              Top 4% on campus
            </span>
          </div>
        </header>

        {/* Wallet balance dashboard */}
        <section className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="px-5 pt-5">
            <p className="text-xs font-medium text-muted-foreground">
              Earned this week
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-extrabold tracking-tight text-foreground">
                $145
              </span>
              <span className="pb-1.5 text-2xl font-extrabold tracking-tight text-muted-foreground">
                .00
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              +38% vs last week
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 px-5">
            <button
              type="button"
              onClick={() => showToast('Cash out requested')}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition active:scale-[0.98]"
            >
              Cash Out
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={() => showToast('Viewing payout history')}
              className="rounded-full border border-border bg-background px-5 py-3.5 text-sm font-semibold text-foreground transition active:scale-95"
            >
              History
            </button>
          </div>

          {/* recent payouts */}
          <ul className="mt-5 divide-y divide-border border-t border-border">
            {cashouts.map((c) => (
              <li
                key={c.label}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full',
                      c.status === 'Cleared'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {c.status === 'Cleared' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-foreground">
                      {c.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{c.status}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground">
                  +${c.amount}.00
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Active briefs feed */}
        <div className="mt-6 flex items-center justify-between px-4">
          <h2 className="text-base font-extrabold tracking-tight text-foreground">
            Active Promo Briefs
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {briefs.length} available
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-3 px-4">
          {briefs.map((b) => {
            const Platform = platformIcon(b.platform)
            const done = submitted[b.id]
            return (
              <article
                key={b.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* header */}
                <div className="flex items-center gap-3 p-3.5">
                  <div className="relative h-11 w-11 overflow-hidden rounded-xl ring-1 ring-border">
                    <Image
                      src={b.logo || '/placeholder.svg'}
                      alt={b.host}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {b.title}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {b.host} · {b.spotsLeft} spots left
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">
                    +${b.payout}.00
                  </span>
                </div>

                {/* requirement */}
                <div className="mx-3.5 mb-3 flex items-center gap-2 rounded-xl bg-background px-3 py-2">
                  <Platform className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {b.requirement}
                  </span>
                </div>

                {/* upload drop-zone */}
                <div className="px-3.5 pb-3.5">
                  {done ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-sm font-bold text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                      Submitted for approval
                    </div>
                  ) : (
                    <div
                      onClick={() => inputRef.current?.click()}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        setDragOver(true)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(true)
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleFiles(e.dataTransfer.files, b.id)
                      }}
                      className={cn(
                        'relative flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-background py-5 transition active:scale-[0.99] focus:outline-none',
                        dragOver || uploading
                          ? 'border-2 border-solid' : 'border-2 border-dashed',
                        dragOver || uploading
                          ? 'border-[rgba(57,255,20,0.9)] shadow-[0_0_18px_rgba(57,255,20,0.12)]'
                          : 'border-border'
                      )}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="sr-only"
                        onChange={(e) => handleFiles(e.target.files, b.id)}
                      />
                      <UploadCloud className="h-6 w-6 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        Submit Content for Approval
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Drop a screen recording or link · PNG, MP4
                      </span>
                      {uploading && (
                        <div className="absolute right-3 top-3 flex items-center gap-2">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-[rgba(57,255,20,0.95)] border-border" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      {toast && <Toast message={toast} />}
      </div>
    </div>
  )
}
