'use client'

import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'
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
  const [showTimer, setShowTimer] = useState(false)

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
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-primary">{Math.round(progress)}%</span>
            <button
              type="button"
              onClick={() => setShowTimer(!showTimer)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium transition-colors',
                showTimer
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Timer className="size-3" />
              Focus
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        <p className="mt-2 text-xs text-muted-foreground">{remainingLabel}</p>
      </div>

      {showTimer && <PomodoroTimer />}

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

function PomodoroTimer() {
  const [duration, setDuration] = useState(25 * 60) // 25 min default
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      // Timer done
      if (!isBreak) {
        setSessions((s) => s + 1)
        setIsBreak(true)
        setTimeLeft(5 * 60) // 5 min break
      } else {
        setIsBreak(false)
        setTimeLeft(duration)
      }
      setRunning(false)
      // Try to notify
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('RoutinePro.ai', {
          body: isBreak ? 'Break over — time to focus!' : 'Focus session complete. Take a break.',
        })
      }
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [running, timeLeft, isBreak, duration])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setRunning(false)
    setIsBreak(false)
    setTimeLeft(duration)
  }

  const pct = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((duration - timeLeft) / duration) * 100

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="size-4 text-primary" />
          <span className="text-xs font-medium text-foreground">
            {isBreak ? 'Break' : 'Focus'} Timer
          </span>
        </div>
        {sessions > 0 && (
          <span className="text-xs text-muted-foreground">{sessions} sessions done</span>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-3">
        <p className={cn(
          'text-3xl font-bold tabular-nums',
          isBreak ? 'text-green-500' : 'text-primary'
        )}>
          {formatTime(timeLeft)}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', isBreak ? 'bg-green-500' : 'bg-primary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="size-3.5" />
        </Button>
        <Button size="sm" onClick={() => setRunning(!running)}>
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? 'Pause' : 'Start'}
        </Button>
      </div>

      {/* Duration presets (only show when not running) */}
      {!running && !isBreak && timeLeft === duration && (
        <div className="mt-3 flex justify-center gap-1.5">
          {[15, 25, 45, 60].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => { setDuration(min * 60); setTimeLeft(min * 60) }}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                duration === min * 60
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {min}m
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
