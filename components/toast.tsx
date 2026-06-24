'use client'

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-[#111117] px-4 py-3 text-sm font-semibold text-foreground shadow-[0_0_20px_rgba(0,0,0,0.35)]">
      {message}
    </div>
  )
}
