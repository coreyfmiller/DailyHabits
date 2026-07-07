'use client'

import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { formatClock } from './use-now'

export function FocusTimer() {
  const [seconds, setSeconds] = useLocalStorage('focus-seconds', 0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Timer className="size-4 text-primary" />
          Deep Work Focus
        </div>
        <span className="font-mono text-xl tabular-nums text-primary">{formatClock(seconds)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={running ? 'secondary' : 'default'}
          className="flex-1"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? 'Pause' : seconds > 0 ? 'Resume' : 'Start'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setRunning(false)
            setSeconds(0)
          }}
          aria-label="Reset focus timer"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  )
}
