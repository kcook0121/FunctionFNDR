'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, Play, Pause, Heart, ThumbsDown, Plus, Music2 } from 'lucide-react'
import { parties as seedParties, tracks as seedTracks, type Party, type Track } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Toast } from '@/components/toast'
import { useToast } from '@/lib/useToast'

export function Soundstage() {
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [tracks, setTracks] = useState<Track[]>(() => seedTracks.slice(0, 8))
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [dislikes, setDislikes] = useState<Record<string, number>>({})
  const [suggestText, setSuggestText] = useState('')
  const [themeVotes, setThemeVotes] = useState<Record<string, number>>({
    'Glow Night': 12,
    'Jersey Night': 6,
    'Y2K': 8,
    'Blackout': 4,
    'Beach Night': 3,
  })
  const { toast, showToast } = useToast()

  const partyList = useMemo(() => seedParties, [])

  function openParty(p: Party) {
    setSelectedParty(p)
    setView('detail')
    showToast(`${p.name} opened`)
  }

  function goBack() {
    setView('list')
    setSelectedParty(null)
    setCurrentTrackId(null)
    setIsPlaying(false)
  }

  function togglePlay(trackId: string) {
    if (currentTrackId === trackId) {
      setIsPlaying((v) => !v)
    } else {
      setCurrentTrackId(trackId)
      setIsPlaying(true)
    }
    showToast('Playback toggled')
  }

  function toggleLike(trackId: string) {
    setLikes((s) => ({ ...s, [trackId]: (s[trackId] || 0) + 1 }))
    showToast('Liked')
  }

  function toggleDislike(trackId: string) {
    setDislikes((s) => ({ ...s, [trackId]: (s[trackId] || 0) + 1 }))
    showToast('Disliked')
  }

  function suggestSong() {
    if (!suggestText.trim()) return showToast('Enter a suggestion')
    const id = `sugg-${Date.now()}`
    setTracks((t) => [{ id, title: suggestText.trim(), artist: 'Suggested', art: '/placeholder.svg' } as Track, ...t])
    setSuggestText('')
    showToast('Suggestion added')
  }

  function voteTheme(name: string) {
    setThemeVotes((s) => ({ ...s, [name]: (s[name] || 0) + 1 }))
    showToast('Vote counted')
  }

  const totalVotes = Object.values(themeVotes).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        <header className="px-4 pt-6">
          <p className="text-xs font-medium text-muted-foreground">Soundstage</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Live Party List</h1>
        </header>

        {view === 'list' ? (
          <div className="mt-4 space-y-3 px-4">
            {partyList.map((p) => (
              <button
                key={p.id}
                onClick={() => openParty(p)}
                className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 text-left"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <Image src={p.image || '/placeholder.svg'} alt={p.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-bold text-foreground">{p.name}</h3>
                    <span className="text-xs font-semibold text-muted-foreground">{p.attendance}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{p.host} · {p.genre}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 px-4">
            <div className="mb-3 flex items-center gap-3">
              <button onClick={goBack} className="rounded-full p-2 text-muted-foreground">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{selectedParty?.venue}</p>
                <h2 className="text-lg font-extrabold text-foreground">{selectedParty?.name}</h2>
                <p className="text-xs text-muted-foreground">Hosted by {selectedParty?.host}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground">Tonight</p>
              <p className="mt-1 text-sm font-bold text-foreground">{selectedParty?.genre}</p>
            </div>

            <div className="mt-4 space-y-3">
              {tracks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                    <Image src={t.art || '/placeholder.svg'} alt={t.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleLike(t.id)} className="p-2 text-primary">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button onClick={() => toggleDislike(t.id)} className="p-2 text-muted-foreground">
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                    <button onClick={() => togglePlay(t.id)} className="rounded-full bg-primary/10 p-2">
                      {currentTrackId === t.id && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-card p-3">
              <p className="text-sm font-semibold text-muted-foreground">Suggest a song</p>
              <div className="mt-2 flex gap-2">
                <input value={suggestText} onChange={(e) => setSuggestText(e.target.value)} placeholder="Song title - Artist" className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none" />
                <button onClick={suggestSong} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  <Plus className="h-4 w-4" /> Suggest
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-3">
              <p className="text-sm font-semibold text-muted-foreground">Theme Vote</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.keys(themeVotes).map((name) => (
                  <button key={name} onClick={() => voteTheme(name)} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((themeVotes[name] / totalVotes) * 100)}%</p>
                    </div>
                    <span className="text-xs font-extrabold text-foreground">{themeVotes[name]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* mini player */}
      {currentTrackId && (
        <div className="fixed inset-x-4 bottom-20 z-40 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-md relative">
              <Image src={(tracks.find((t) => t.id === currentTrackId)?.art) || '/placeholder.svg'} alt="now" fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{tracks.find((t) => t.id === currentTrackId)?.title}</p>
              <p className="truncate text-xs text-muted-foreground">{tracks.find((t) => t.id === currentTrackId)?.artist}</p>
            </div>
            <button onClick={() => setIsPlaying((v) => !v)} className="rounded-full bg-primary/10 p-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}
