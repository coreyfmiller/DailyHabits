'use client'

import { Check, Dumbbell, Plus, Timer, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { HabitCheckbox } from './primitives'

type Lift = { id: number; text: string }

type Exercise = { name: string; sets: string; done: boolean }

// Mon / Wed / Fri — Push & Legs (compound focus)
const PUSH_LEGS: Omit<Exercise, 'done'>[] = [
  { name: 'Goblet Squats', sets: '3×12' },
  { name: 'Dumbbell Bench Press', sets: '3×10' },
  { name: 'Overhead Press', sets: '3×10' },
  { name: 'Romanian Deadlifts', sets: '3×12' },
  { name: 'Lateral Raises', sets: '3×15' },
  { name: 'Tricep Kickbacks', sets: '3×12' },
]

// Tue / Thu — Pull & Arms (back and biceps focus)
const PULL_ARMS: Omit<Exercise, 'done'>[] = [
  { name: 'Bent-Over Rows', sets: '3×10' },
  { name: 'Single-Arm Rows', sets: '3×10' },
  { name: 'Reverse Flyes', sets: '3×15' },
  { name: 'Hammer Curls', sets: '3×12' },
  { name: 'Bicep Curls', sets: '3×12' },
  { name: 'Shrugs', sets: '3×15' },
]

function getTodayRoutine(): { exercises: Omit<Exercise, 'done'>[]; label: string } {
  const dow = new Date().getDay() // 0=Sun, 1=Mon...
  // Mon(1), Wed(3), Fri(5) = Push & Legs
  // Tue(2), Thu(4) = Pull & Arms
  if (dow === 1 || dow === 3 || dow === 5) {
    return { exercises: PUSH_LEGS, label: 'Push & Legs' }
  }
  return { exercises: PULL_ARMS, label: 'Pull & Arms' }
}

export function FitnessSection({
  shower,
  onToggleShower,
}: {
  shower: boolean
  onToggleShower: (v: boolean) => void
}) {
  const [draft, setDraft] = useState('')
  const [lifts, setLifts] = useLocalStorage<Lift[]>('lifts', [])

  const { exercises: todayExercises, label: routineLabel } = getTodayRoutine()

  const [routine, setRoutine] = useLocalStorage<Exercise[]>(
    'dumbbell-routine',
    todayExercises.map((e) => ({ ...e, done: false }))
  )

  const addLift = () => {
    const text = draft.trim()
    if (!text) return
    setLifts((prev) => [...prev, { id: Date.now(), text }])
    setDraft('')
  }

  const toggleExercise = (index: number) =>
    setRoutine((prev) =>
      prev.map((e, i) => (i === index ? { ...e, done: !e.done } : e))
    )

  const completedCount = routine.filter((e) => e.done).length

  return (
    <div className="grid gap-3">
      {/* Daily dumbbell routine */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Timer className="size-4 text-primary" />
            20-Min Dumbbell — {routineLabel}
          </div>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs text-primary">
            {completedCount}/{routine.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {routineLabel === 'Push & Legs' ? 'Mon · Wed · Fri' : 'Tue · Thu'}
        </p>
        <ul className="mt-3 grid gap-1.5">
          {routine.map((exercise, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggleExercise(i)}
                className="flex w-full items-center gap-3 rounded-md bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/60"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    exercise.done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  <Check className={`size-3.5 ${exercise.done ? 'opacity-100' : 'opacity-0'}`} />
                </span>
                <span
                  className={`flex-1 ${exercise.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                >
                  {exercise.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{exercise.sets}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional lifts log */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Dumbbell className="size-4 text-primary" />
          Extra lifts
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addLift()
            }}
            placeholder="e.g. Farmer's walk 2×40m"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button size="sm" onClick={addLift}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {lifts.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {lifts.map((lift) => (
              <li
                key={lift.id}
                className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm text-foreground"
              >
                <span className="min-w-0 truncate">{lift.text}</span>
                <button
                  type="button"
                  onClick={() => setLifts((prev) => prev.filter((l) => l.id !== lift.id))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${lift.text}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <HabitCheckbox
        checked={shower}
        onChange={onToggleShower}
        label="Post-workout shower"
        hint="Rinse off & refresh"
      />
    </div>
  )
}
