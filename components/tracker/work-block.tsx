'use client'

import { useLocalStorage } from '@/lib/use-local-storage'
import { ProgressBar } from './primitives'
import { useNow } from './use-now'

export function WorkBlock({
  id,
  startMin,
  endMin,
}: {
  id: string
  startMin: number
  endMin: number
}) {
  const now = useNow(30_000)
  const [notes, setNotes] = useLocalStorage<string>(`work-notes-${id}`, '')

  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const totalSpan = endMin - startMin
  const elapsed = Math.min(totalSpan, Math.max(0, minutesNow - startMin))
  const progress = (elapsed / totalSpan) * 100
  const remainingMin = Math.max(0, endMin - minutesNow)
  const remainingLabel =
    minutesNow < startMin
      ? 'Not started yet'
      : remainingMin <= 0 || minutesNow >= endMin
        ? 'Block complete'
        : `${Math.floor(remainingMin / 60)}h ${remainingMin % 60}m remaining`

  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Block progress</span>
          <span className="font-mono tabular-nums text-primary">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">{remainingLabel}</p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Quick notes — what are you working on this block?"
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
      />
    </div>
  )
}
