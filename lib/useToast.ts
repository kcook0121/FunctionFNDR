'use client'

import { useCallback, useEffect, useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 1500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((message: string) => {
    setToast(message)
  }, [])

  return { toast, showToast }
}
