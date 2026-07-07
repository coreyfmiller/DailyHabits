'use client'

import { Check, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from './primitives'
import { formatTimeOfDay, useNow } from './use-now'

const WORK_START_MIN = 8 * 60 + 30 // 8:30 AM
const WORK_END_MIN = 17 * 60 // 5:00 PM

export function WorkBlock() {
  const now = useNow(30_000)
  const [lunchAt, setLunchAt] = useState<Date | null>(null)
  const [lunchNote, setLunchNote] = useState('')

  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const totalSpan = WORK_END_MIN - WORK_START_MIN
  const elapsed = Math.min(totalSpan, Math.max(0, minutesNow - WORK_START_MIN))
  const progress = (elapsed / totalSpan) * 100
  const remainingMin = Math.max(0, WORK_END_MIN - minutesNow)
  const remainingLabel =
    minutesNow < WORK_START_MIN
      ? 'Not started yet'
      : remainingMin === 0
        ? 'Workday complete'
        : `${Math.floor(remainingMin / 60)}h ${remainingMin % 60}m until hard stop`

  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Workday progress</span>
          <span className="font-mono tabular-nums text-primary">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">{remainingLabel}</p>
      </div>

      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <UtensilsCrossed className="size-4 text-primary" />
          Lunch log
        </div>
        {lunchAt ? (
          <div className="mt-2 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <Check className="size-4 text-primary" />
              Logged at {formatTimeOfDay(lunchAt)}
              {lunchNote ? <span className="text-muted-foreground">· {lunchNote}</span> : null}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setLunchAt(null)}>
              Undo
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={lunchNote}
              onChange={(e) => setLunchNote(e.target.value)}
              placeholder="What's for lunch? (optional)"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <Button size="sm" onClick={() => setLunchAt(new Date())}>
              Log lunch
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
