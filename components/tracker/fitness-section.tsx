'use client'

import { Check, Dumbbell, Play, Plus, Timer, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { getTodayRoutine } from '@/lib/workout-config'
import { HabitCheckbox } from './primitives'
import { ActiveWorkout } from './active-workout'

type Lift = { id: number; text: string }

type Exercise = { name: string; sets: string; done: boolean }

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function FitnessSection({
  shower,
  onToggleShower,
}: {
  shower: boolean
  onToggleShower: (v: boolean) => void
}) {
  const [draft, setDraft] = useState('')
  const [lifts, setLifts] = useLocalStorage<Lift[]>('lifts', [])

  const routine = getTodayRoutine()

  // Build storage key from routine ID so each routine tracks independently
  const storageKey = routine ? `workout-${routine.id}` : 'workout-rest'
  const initialExercises: Exercise[] = routine
    ? routine.exercises.map((e) => ({ name: e.name, sets: e.sets, done: false }))
    : []

  const [exercises, setExercises] = useLocalStorage<Exercise[]>(storageKey, initialExercises)

  const addLift = () => {
    const text = draft.trim()
    if (!text) return
    setLifts((prev) => [...prev, { id: Date.now(), text }])
    setDraft('')
  }

  const toggleExercise = (index: number) =>
    setExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, done: !e.done } : e))
    )

  const completedCount = exercises.filter((e) => e.done).length

  // Rest day — no routine scheduled
  if (!routine) {
    return (
      <div className="grid gap-3">
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Timer className="size-4 text-primary" />
            Rest Day
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            No workout scheduled for today. Enjoy your recovery!
          </p>
        </div>

        {/* Extra lifts still available on rest days */}
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

  // Active workout day
  const daysList = routine.days.map((d) => DAY_LABELS[d]).join(' · ')
  const [activeMode, setActiveMode] = useState(false)

  if (activeMode) {
    return (
      <ActiveWorkout
        routineName={routine.name}
        exercises={exercises.map((e) => ({ ...e, id: e.name }))}
        onComplete={(results) => {
          setExercises((prev) => prev.map((e, i) => ({ ...e, done: results[i] })))
          setActiveMode(false)
        }}
        onClose={() => setActiveMode(false)}
      />
    )
  }

  return (
    <div className="grid gap-3">
      {/* Daily routine */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Timer className="size-4 text-primary" />
            {routine.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs text-primary">
              {completedCount}/{exercises.length}
            </span>
            {completedCount < exercises.length && (
              <Button size="xs" onClick={() => setActiveMode(true)}>
                <Play className="size-3" />
                Start
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{daysList}</p>
        <ul className="mt-3 grid gap-1.5">
          {exercises.map((exercise, i) => (
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
