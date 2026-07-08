'use client'

import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Dumbbell, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getWorkoutConfig,
  hasWorkoutConfig,
  setWorkoutConfig,
  TEMPLATES,
  type WorkoutConfig,
  type WorkoutExercise,
  type WorkoutRoutine,
} from '@/lib/workout-config'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function WorkoutSetup() {
  const [config, setConfig] = useState<WorkoutConfig>({ routines: [] })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [newRoutineName, setNewRoutineName] = useState('')
  const [newExercise, setNewExercise] = useState<Record<string, { name: string; sets: string }>>({})

  // Load config on mount
  useEffect(() => {
    const loaded = getWorkoutConfig()
    setConfig(loaded)
    if (!hasWorkoutConfig()) {
      setShowTemplates(true)
    }
  }, [])

  const persist = useCallback((next: WorkoutConfig) => {
    setConfig(next)
    setWorkoutConfig(next)
  }, [])

  // Template selection
  const applyTemplate = (key: string) => {
    const template = TEMPLATES[key]
    if (!template) return
    persist({ routines: template.routines })
    setShowTemplates(false)
  }

  // Routine CRUD
  const addRoutine = () => {
    const name = newRoutineName.trim()
    if (!name) return
    const routine: WorkoutRoutine = {
      id: generateId(),
      name,
      days: [],
      exercises: [],
    }
    persist({ routines: [...config.routines, routine] })
    setNewRoutineName('')
    setExpandedId(routine.id)
  }

  const deleteRoutine = (id: string) => {
    persist({ routines: config.routines.filter((r) => r.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  const toggleDay = (routineId: string, day: number) => {
    persist({
      routines: config.routines.map((r) => {
        if (r.id !== routineId) return r
        const days = r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day].sort()
        return { ...r, days }
      }),
    })
  }

  const updateRoutineName = (routineId: string, name: string) => {
    persist({
      routines: config.routines.map((r) => (r.id === routineId ? { ...r, name } : r)),
    })
  }

  // Exercise CRUD
  const addExercise = (routineId: string) => {
    const draft = newExercise[routineId]
    if (!draft?.name.trim()) return
    const exercise: WorkoutExercise = {
      id: generateId(),
      name: draft.name.trim(),
      sets: draft.sets.trim() || '3×10',
    }
    persist({
      routines: config.routines.map((r) =>
        r.id === routineId ? { ...r, exercises: [...r.exercises, exercise] } : r
      ),
    })
    setNewExercise((prev) => ({ ...prev, [routineId]: { name: '', sets: '' } }))
  }

  const removeExercise = (routineId: string, exerciseId: string) => {
    persist({
      routines: config.routines.map((r) =>
        r.id === routineId ? { ...r, exercises: r.exercises.filter((e) => e.id !== exerciseId) } : r
      ),
    })
  }

  const updateExercise = (routineId: string, exerciseId: string, field: 'name' | 'sets', value: string) => {
    persist({
      routines: config.routines.map((r) =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map((e) => (e.id === exerciseId ? { ...e, [field]: value } : e)) }
          : r
      ),
    })
  }

  const moveExercise = (routineId: string, exerciseId: string, direction: 'up' | 'down') => {
    persist({
      routines: config.routines.map((r) => {
        if (r.id !== routineId) return r
        const idx = r.exercises.findIndex((e) => e.id === exerciseId)
        if (idx < 0) return r
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= r.exercises.length) return r
        const next = [...r.exercises]
        ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
        return { ...r, exercises: next }
      }),
    })
  }

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Dumbbell className="size-4 text-primary" />
          Workout Routines
        </div>
        <Button size="xs" variant="ghost" onClick={() => setShowTemplates((v) => !v)}>
          Reset / Templates
        </Button>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="mt-3 grid gap-2">
          <p className="text-xs text-muted-foreground">Pick a template to replace your current routines:</p>
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyTemplate(key)}
              className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/60"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      )}

      {/* Routine cards */}
      <div className="mt-4 grid gap-3">
        {config.routines.map((routine) => {
          const isExpanded = expandedId === routine.id
          const draft = newExercise[routine.id] ?? { name: '', sets: '' }

          return (
            <div key={routine.id} className="rounded-md border border-border bg-background">
              {/* Card header */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : routine.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <span className="flex-1 text-sm font-medium text-foreground">{routine.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {routine.exercises.length} exercises
                </span>
              </button>

              {/* Day pills (always visible) */}
              <div className="flex flex-wrap items-center gap-1 px-3 pb-2">
                {routine.days.length > 0 ? (
                  routine.days.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-medium text-primary"
                    >
                      {DAY_LABELS[d]}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.65rem] text-muted-foreground">No days assigned</span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border/60 px-3 py-3">
                  {/* Editable name */}
                  <div className="mb-3">
                    <label className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
                      Routine name
                    </label>
                    <input
                      value={routine.name}
                      onChange={(e) => updateRoutineName(routine.id, e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                    />
                  </div>

                  {/* Day picker */}
                  <div className="mb-3">
                    <label className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
                      Days
                    </label>
                    <div className="mt-1 flex gap-1">
                      {DAY_LABELS.map((label, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(routine.id, i)}
                          className={cn(
                            'flex size-8 items-center justify-center rounded-md border text-xs font-medium transition-colors',
                            routine.days.includes(i)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:bg-secondary/60'
                          )}
                        >
                          {label.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercise list */}
                  <div className="mb-3">
                    <label className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
                      Exercises
                    </label>
                    {routine.exercises.length > 0 ? (
                      <ul className="mt-1.5 grid gap-1.5">
                        {routine.exercises.map((exercise, idx) => (
                          <li
                            key={exercise.id}
                            className="flex items-center gap-1.5 rounded-md bg-secondary/40 px-2 py-1.5"
                          >
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => moveExercise(routine.id, exercise.id, 'up')}
                                disabled={idx === 0}
                                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                                aria-label="Move up"
                              >
                                <ArrowUp className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveExercise(routine.id, exercise.id, 'down')}
                                disabled={idx === routine.exercises.length - 1}
                                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                                aria-label="Move down"
                              >
                                <ArrowDown className="size-3" />
                              </button>
                            </div>
                            <input
                              value={exercise.name}
                              onChange={(e) => updateExercise(routine.id, exercise.id, 'name', e.target.value)}
                              className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-sm text-foreground focus:border-border focus:outline-none"
                            />
                            <input
                              value={exercise.sets}
                              onChange={(e) => updateExercise(routine.id, exercise.id, 'sets', e.target.value)}
                              className="w-20 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-right font-mono text-xs text-muted-foreground focus:border-border focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeExercise(routine.id, exercise.id)}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                              aria-label={`Remove ${exercise.name}`}
                            >
                              <X className="size-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1.5 text-xs text-muted-foreground">No exercises yet.</p>
                    )}
                  </div>

                  {/* Add exercise */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          [routine.id]: { ...draft, name: e.target.value },
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) addExercise(routine.id)
                      }}
                      placeholder="Exercise name"
                      className="flex-1 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                    />
                    <input
                      value={draft.sets}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          [routine.id]: { ...draft, sets: e.target.value },
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) addExercise(routine.id)
                      }}
                      placeholder="3×10"
                      className="w-24 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                    />
                    <Button size="sm" onClick={() => addExercise(routine.id)}>
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>

                  {/* Delete routine */}
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <Button size="sm" variant="destructive" onClick={() => deleteRoutine(routine.id)}>
                      <X className="size-4" />
                      Delete routine
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add routine */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={newRoutineName}
          onChange={(e) => setNewRoutineName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) addRoutine()
          }}
          placeholder="New routine name"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <Button size="sm" onClick={addRoutine}>
          <Plus className="size-4" />
          Add routine
        </Button>
      </div>
    </div>
  )
}
