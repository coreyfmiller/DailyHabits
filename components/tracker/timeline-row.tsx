'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TimelineRow({
  icon: Icon,
  time,
  title,
  subtitle,
  accent = 'primary',
  isLast = false,
  headerRight,
  children,
}: {
  icon: LucideIcon
  time: string
  title: string
  subtitle?: string
  accent?: 'primary' | 'muted' | 'destructive'
  isLast?: boolean
  headerRight?: ReactNode
  children?: ReactNode
}) {
  const dotClasses = {
    primary: 'border-primary/40 bg-primary/15 text-primary',
    muted: 'border-border bg-secondary text-muted-foreground',
    destructive: 'border-destructive/50 bg-destructive/15 text-destructive',
  }[accent]

  return (
    <div className="relative flex gap-3 sm:gap-5">
      {/* Rail */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'z-10 flex size-10 shrink-0 items-center justify-center rounded-full border',
            dotClasses,
          )}
        >
          <Icon className="size-5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      {/* Content */}
      <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-8')}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-wide text-muted-foreground">{time}</p>
            <h2 className="text-pretty text-base font-semibold leading-tight text-foreground">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>

        {children ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}
