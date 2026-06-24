'use client'

import { type ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { AuthScreen } from './auth-screen'
import { OnboardingScreen } from './onboarding-screen'

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-primary" />
          Loading&hellip;
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return <AuthScreen />
  if (status === 'needs_onboarding') return <OnboardingScreen />
  return <>{children}</>
}
