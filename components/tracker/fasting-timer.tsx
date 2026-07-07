'use client'

import { Flame, RotateCcw } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { ProgressBar } from './primitives'
import { formatClock, formatTimeOfDay, useNow } from './use-now'

const GOAL_HOURS = 16 // target overnight fast

/** Shared fasting state. Fast begins at 5:00 PM (the eating hard stop). */
export function useFast() {
  const now = useNow(1000)

  const defaultStart = (() => {
    const d = new Date()
    d.setHours(17, 0, 0, 0) // 5:00 PM today
    return d.toISOString()
  })()

  const [startIso, setStartIso] = useLocalStorage<string>('fast-start', defaultStart)
  const start = new Date(startIso)

  const reset = useCallback(() => setStartIso(new Date().toISOString()), [setStartIso])

  const diffMs = now.getTime() - start.getTime()
  const started = diffMs >= 0
  const elapsedSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const untilStartSeconds = started ? 0 : Math.floor(-diffMs / 1000)
  const progress = Math.min(100, (elapsedSeconds / (GOAL_HOURS * 3600)) * 100)

  return {
    start,
    started,
    elapsedSeconds,
    untilStartSeconds,
    progress,
    reset,
    goalHours: GOAL_HOURS,
    startLabel: formatTimeOfDay(start),
  }
}

type Fast = ReturnType<typeof useFast>

export function FastingPill({ fast }: { fast: Fast }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
      <Flame className="size-4 text-primary" />
      <span className="text-xs text-muted-foreground">Fasting</span>
      <span className="font-mono text-sm font-medium tabular-nums text-primary">
        {fast.started ? formatClock(fast.elapsedSeconds) : `starts ${fast.startLabel}`}
      </span>
    </div>
  )
}

export function FastingTimer({ fast }: { fast: Fast }) {
  const hours = Math.floor(fast.elapsedSeconds / 3600)

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Time since last meal</p>
          <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-foreground">
            {fast.started ? formatClock(fast.elapsedSeconds) : `—:—`}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-primary">{hours}h logged</p>
          <p className="text-muted-foreground">{fast.goalHours}h goal</p>
        </div>
      </div>

      <div>
        <ProgressBar value={fast.progress} />
        <p className="mt-2 text-xs text-muted-foreground">
          {fast.started
            ? `Fast started at ${fast.startLabel}. ${
                fast.progress >= 100
                  ? 'Goal reached — nice work.'
                  : `${Math.round(fast.progress)}% of your ${fast.goalHours}h goal.`
              }`
            : `Your eating window closes at ${fast.startLabel}. The fast begins then.`}
        </p>
      </div>

      <Button variant="secondary" size="sm" onClick={fast.reset} className="justify-self-start">
        <RotateCcw className="size-4" />
        Reset — I just ate
      </Button>
    </div>
  )
}
