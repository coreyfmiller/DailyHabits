'use client'

import { ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function TimelineRow({
  icon: Icon,
  time,
  title,
  subtitle,
  accent = 'primary',
  status = 'future',
  isLast = false,
  headerRight,
  children,
}: {
  icon: LucideIcon
  time: string
  title: string
  subtitle?: string
  accent?: 'primary' | 'muted' | 'destructive'
  status?: 'past' | 'active' | 'future'
  isLast?: boolean
  headerRight?: ReactNode
  children?: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  const isPast = status === 'past'
  const isActive = status === 'active'

  const dotClasses = {
    primary: 'border-primary/40 bg-primary/15 text-primary',
    muted: 'border-border bg-secondary text-muted-foreground',
    destructive: 'border-destructive/50 bg-destructive/15 text-destructive',
  }[accent]

  return (
    <div
      className={cn(
        'relative flex gap-3 sm:gap-5 transition-opacity duration-300',
        isPast && !isActive && 'opacity-50',
      )}
    >
      {/* Rail */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'z-10 flex size-10 shrink-0 items-center justify-center rounded-full border transition-all',
            dotClasses,
            isActive && 'ring-2 ring-primary/30 scale-110',
          )}
        >
          <Icon className="size-5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      {/* Content */}
      <div className={cn('min-w-0 flex-1', isLast ? 'pb-0' : 'pb-8')}>
        <button
          type="button"
          onClick={() => children && setCollapsed(!collapsed)}
          className={cn(
            'flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-1 text-left',
            children && 'cursor-pointer',
          )}
        >
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">{time}</p>
            <h2 className={cn(
              'text-pretty font-semibold leading-tight',
              isActive ? 'text-base text-primary' : 'text-[0.95rem] text-foreground',
            )}>
              {title}
            </h2>
            {subtitle && !collapsed ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerRight ? <div>{headerRight}</div> : null}
            {children && (
              <ChevronDown
                className={cn(
                  'size-4 text-muted-foreground transition-transform',
                  collapsed && '-rotate-90',
                )}
              />
            )}
          </div>
        </button>

        {children && !collapsed ? (
          <div className={cn(
            'mt-3 rounded-xl border border-border/70 p-4 shadow-sm transition-all',
            isActive ? 'bg-card border-primary/20 shadow-primary/5' : 'bg-card',
          )}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}
