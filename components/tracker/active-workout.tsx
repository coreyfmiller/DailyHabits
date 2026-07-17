'use client'

import { Check, ChevronRight, Pause, Play, RotateCcw, Trophy, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WorkoutExercise } from '@/lib/workout-config'

type ActiveExercise = WorkoutExercise & { done: boolean }

export function ActiveWorkout({
  routineName,
  exercises,
  onComplete,
  onClose,
}: {
  routineName: string
  exercises: ActiveExercise[]
  onComplete: (completed: boolean[]) => void
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(
    // Start at the first incomplete exercise
    exercises.findIndex((e) => !e.done) >= 0 ? exercises.findIndex((e) => !e.done) : 0
  )
  const [completed, setCompleted] = useState<boolean[]>(exercises.map((e) => e.done))
  const [restTimer, setRestTimer] = useState(0)
  const [restRunning, setRestRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const current = exercises[currentIndex]
  const completedCount = completed.filter(Boolean).length
  const totalCount = exercises.length

  // Rest timer
  useEffect(() => {
    if (!restRunning || restTimer <= 0) return
    const id = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          setRestRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [restRunning, restTimer])

  const startRest = (seconds: number) => {
    setRestTimer(seconds)
    setRestRunning(true)
  }

  const markDone = () => {
    const next = [...completed]
    next[currentIndex] = true
    setCompleted(next)

    // Auto-advance to next incomplete or finish
    const nextIncomplete = next.findIndex((done, i) => !done && i > currentIndex)
    if (nextIncomplete >= 0) {
      setCurrentIndex(nextIncomplete)
      startRest(60)
    } else if (next.every(Boolean)) {
      setFinished(true)
    } else {
      // Find any remaining
      const anyRemaining = next.findIndex((done) => !done)
      if (anyRemaining >= 0) setCurrentIndex(anyRemaining)
      else setFinished(true)
    }
  }

  const handleFinish = () => {
    onComplete(completed)
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15">
            <Trophy className="size-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Workout Complete!</h2>
          <p className="mt-2 text-muted-foreground">
            {completedCount}/{totalCount} exercises finished
          </p>
          <Button size="lg" className="mt-6" onClick={handleFinish}>
            Done
          </Button>
        </div>
      </div>
    )
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{routineName}</p>
          <p className="text-sm font-semibold text-foreground">{completedCount}/{totalCount}</p>
        </div>
        <div className="w-5" />
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Current exercise */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Rest timer overlay */}
        {restRunning && restTimer > 0 && (
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Rest</p>
            <p className="text-5xl font-bold tabular-nums text-primary">{formatTime(restTimer)}</p>
            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={() => { setRestRunning(false); setRestTimer(0) }}>
                Skip
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRestRunning(!restRunning)}>
                {restRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Exercise info */}
        {(!restRunning || restTimer <= 0) && (
          <>
            <span className="mb-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              Exercise {currentIndex + 1} of {totalCount}
            </span>
            <h2 className="text-center text-2xl font-bold text-foreground">{current.name}</h2>
            <p className="mt-2 text-lg font-mono text-muted-foreground">{current.sets}</p>

            <Button size="lg" className="mt-8 w-48" onClick={markDone}>
              <Check className="size-5" />
              Done
            </Button>

            {/* Rest timer quick-start buttons */}
            <div className="mt-6 flex items-center gap-2">
              <p className="text-xs text-muted-foreground mr-2">Rest:</p>
              {[30, 60, 90, 120].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => startRest(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {s}s
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Exercise list at bottom */}
      <div className="border-t border-border/40 px-4 py-3 max-h-36 overflow-y-auto">
        <div className="flex gap-1.5 flex-wrap">
          {exercises.map((ex, i) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => { setCurrentIndex(i); setRestRunning(false); setRestTimer(0) }}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                i === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : completed[i]
                  ? 'bg-primary/20 text-primary line-through'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
