'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function HabitCheckbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 text-left transition-colors',
        'hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        checked && 'border-primary/40 bg-primary/10',
      )}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-md border border-border transition-colors',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'bg-background',
        )}
      >
        <Check className={cn('size-3.5 transition-opacity', checked ? 'opacity-100' : 'opacity-0')} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            'block text-sm font-medium leading-tight transition-colors',
            checked ? 'text-foreground' : 'text-foreground/90',
          )}
        >
          {label}
        </span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </button>
  )
}

export function ProgressBar({
  value,
  className,
  tone = 'primary',
}: {
  value: number
  className?: string
  tone?: 'primary' | 'destructive'
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          tone === 'primary' ? 'bg-primary' : 'bg-destructive',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.7rem] font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}
