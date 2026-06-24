import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type Size = 'default' | 'sm' | 'lg' | 'xs'

function variantClass(v: Variant) {
  switch (v) {
    case 'outline':
      return 'border-border bg-background text-foreground'
    case 'secondary':
      return 'bg-secondary text-secondary-foreground'
    case 'ghost':
      return 'bg-transparent text-foreground'
    case 'destructive':
      return 'bg-destructive/10 text-destructive'
    case 'link':
      return 'text-primary underline-offset-4'
    default:
      return 'bg-primary text-primary-foreground'
  }
}

function sizeClass(s: Size) {
  switch (s) {
    case 'xs':
      return 'h-6 px-2 text-xs'
    case 'sm':
      return 'h-7 px-2.5 text-sm'
    case 'lg':
      return 'h-10 px-4 text-sm'
    default:
      return 'h-8 px-3 text-sm'
  }
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'default', size = 'default', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition active:scale-95 disabled:opacity-50',
        variantClass(variant),
        sizeClass(size),
        className,
      )}
    />
  )
})

export { Button }
