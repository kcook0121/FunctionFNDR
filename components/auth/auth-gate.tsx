'use client'

import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { AuthScreen } from '@/components/auth/auth-screen'
import { OnboardingScreen } from '@/components/auth/onboarding-screen'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, profileLoading, session, profile } = useAuth()

  if (loading || (session && profileLoading && !profile)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Checking your campus pass…</p>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  if (!profile?.onboardingComplete) {
    return <OnboardingScreen />
  }

  return <>{children}</>
}
