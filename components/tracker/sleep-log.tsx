'use client'

import { Moon } from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'

const WAKE_TIME_HOURS = 6.5 // 6:30 AM

function calculateHoursSlept(bedtime: string): number | null {
  if (!bedtime) return null
  const [h, m] = bedtime.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  let bedHours = h + m / 60
  // If bedtime is before wake time (e.g. 10 PM = 22), assume previous night
  // Bed at 22:00, wake at 6:30 → 8.5h
  // Bed at 01:00, wake at 6:30 → 5.5h
  if (bedHours > WAKE_TIME_HOURS) {
    // bedtime is evening (e.g. 22:00) → hours = 24 - bed + wake
    return 24 - bedHours + WAKE_TIME_HOURS
  }
  // bedtime is after midnight (e.g. 01:00) → hours = wake - bed
  return WAKE_TIME_HOURS - bedHours
}

function renderStars(quality: number): string {
  return '★'.repeat(quality) + '☆'.repeat(5 - quality)
}

export function SleepLog() {
  const [bedtime, setBedtime] = useLocalStorage('sleep-bedtime', '')
  const [quality, setQuality] = useLocalStorage('sleep-quality', 0)

  const hoursSlept = calculateHoursSlept(bedtime)
  const hasSummary = bedtime && quality > 0

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Moon className="size-4 text-indigo-500" />
        Sleep Log
      </div>

      {hasSummary ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5">
          <span className="text-sm text-foreground">
            {hoursSlept !== null ? `${hoursSlept.toFixed(1)}h` : '—'} · {renderStars(quality)}
          </span>
          <button
            type="button"
            onClick={() => {
              setBedtime('')
              setQuality(0)
            }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="grid gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
          {/* Bedtime input */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Bedtime last night</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            {hoursSlept !== null && (
              <span className="text-xs text-muted-foreground">
                ≈ {hoursSlept.toFixed(1)}h sleep
              </span>
            )}
          </div>

          {/* Quality rating */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Sleep quality</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuality(n)}
                  className={cn(
                    'size-7 rounded-full border text-xs font-medium transition-colors',
                    quality >= n
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
