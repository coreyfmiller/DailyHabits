'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ArrowDown, ArrowUp, Calendar, Check, ChevronRight,
  Clock, Dumbbell, Flame, Heart, Library, ListChecks, Loader2, Plus,
  Search, Sparkles, Timer, Trash2, X, Zap, Play, RotateCcw,
  Target, Trophy, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getWorkoutConfig, setWorkoutConfig, getTodayRoutine, TEMPLATES,
  type WorkoutConfig, type WorkoutRoutine, type WorkoutExercise, type WorkoutTemplate
} from '@/lib/workout-config'
import {
  EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS,
  searchExercises, getExercisesByMuscleGroup,
  type MuscleGroup, type Equipment, type LibraryExercise
} from '@/lib/exercise-library'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function estimateDuration(exercises: WorkoutExercise[]): string {
  // Rough estimate: 3 min per exercise on average
  const mins = exercises.length * 3
  if (mins < 60) return `~${mins} min`
  return `~${Math.round(mins / 5) * 5} min`
}

type View = 'home' | 'routine-detail' | 'create' | 'templates' | 'library' | 'ai-builder'

export default function WorkoutsPage() {
  const [config, setConfig] = useState<WorkoutConfig>({ routines: [] })
  const [view, setView] = useState<View>('home')
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConfig(getWorkoutConfig())
    setMounted(true)
  }, [])

  const persist = useCallback((next: WorkoutConfig) => {
    setConfig(next)
    setWorkoutConfig(next)
  }, [])

  const todayRoutine = useMemo(() => {
    const dow = new Date().getDay()
    return config.routines.find((r) => r.days.includes(dow)) ?? null
  }, [config])

  const selectedRoutine = config.routines.find((r) => r.id === selectedRoutineId) ?? null

  const openRoutine = (id: string) => {
    setSelectedRoutineId(id)
    setView('routine-detail')
  }

  if (!mounted) return <WorkoutSkeleton />

  return (
    <div className="min-h-dvh bg-background">
      {view === 'home' && (
        <HomeView
          config={config}
          persist={persist}
          todayRoutine={todayRoutine}
          onOpenRoutine={openRoutine}
          onNavigate={setView}
        />
      )}
      {view === 'routine-detail' && selectedRoutine && (
        <RoutineDetailView
          routine={selectedRoutine}
          config={config}
          persist={persist}
          onBack={() => setView('home')}
        />
      )}
      {view === 'create' && (
        <CreateRoutineView
          config={config}
          persist={persist}
          onBack={() => setView('home')}
          onCreated={(id) => { openRoutine(id) }}
        />
      )}
      {view === 'templates' && (
        <TemplateLibraryView
          config={config}
          persist={persist}
          onBack={() => setView('home')}
        />
      )}
      {view === 'library' && (
        <ExerciseLibraryView onBack={() => setView('home')} />
      )}
      {view === 'ai-builder' && (
        <AiWorkoutBuilder
          config={config}
          persist={persist}
          onBack={() => setView('home')}
        />
      )}
    </div>
  )
}

/* ─── Skeleton ─── */
function WorkoutSkeleton() {
  return (
    <div className="min-h-dvh bg-background p-4">
      <div className="mx-auto max-w-lg animate-pulse space-y-4">
        <div className="h-8 w-32 rounded-md bg-secondary" />
        <div className="h-40 rounded-xl bg-secondary" />
        <div className="h-6 w-24 rounded bg-secondary" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Home View ─── */
function HomeView({
  config, persist, todayRoutine, onOpenRoutine, onNavigate
}: {
  config: WorkoutConfig
  persist: (c: WorkoutConfig) => void
  todayRoutine: WorkoutRoutine | null
  onOpenRoutine: (id: string) => void
  onNavigate: (v: View) => void
}) {
  const dow = new Date().getDay()
  const todayLabel = DAY_FULL[dow]
  const [nukeArmed, setNukeArmed] = useState(false)

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
            href="/app"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Workouts</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Today's Workout Hero */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Today&apos;s Workout</h2>
            <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {todayLabel}
            </span>
          </div>

          {todayRoutine ? (
            <button
              type="button"
              onClick={() => onOpenRoutine(todayRoutine.id)}
              className="group w-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    Scheduled
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">
                    {todayRoutine.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ListChecks className="size-3.5" />
                      {todayRoutine.exercises.length} exercises
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {estimateDuration(todayRoutine.exercises)}
                    </span>
                  </div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">
                  <Play className="size-5 ml-0.5" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {todayRoutine.exercises.slice(0, 4).map((e) => (
                  <span key={e.id} className="rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground">
                    {e.name}
                  </span>
                ))}
                {todayRoutine.exercises.length > 4 && (
                  <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">
                    +{todayRoutine.exercises.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary">
                <Heart className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Rest Day</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No workout scheduled. Recover, stretch, and come back stronger.
              </p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('ai-builder')}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <span className="text-[0.65rem] font-medium text-primary">AI Build</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3 transition-colors hover:bg-secondary/60"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Plus className="size-4" />
            </div>
            <span className="text-[0.65rem] font-medium text-foreground">Manual</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('templates')}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3 transition-colors hover:bg-secondary/60"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Trophy className="size-4" />
            </div>
            <span className="text-[0.65rem] font-medium text-foreground">Templates</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 p-3 transition-colors hover:bg-secondary/60"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Library className="size-4" />
            </div>
            <span className="text-[0.65rem] font-medium text-foreground">Exercises</span>
          </button>
        </section>

        {/* My Routines */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Dumbbell className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">My Routines</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {config.routines.length} {config.routines.length === 1 ? 'routine' : 'routines'}
            </span>
          </div>

          {config.routines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
              <Dumbbell className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No routines yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a custom routine or pick from our template library.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button size="sm" onClick={() => onNavigate('create')}>
                  <Plus className="size-4" /> Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => onNavigate('templates')}>
                  <Sparkles className="size-4" /> Templates
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {config.routines.map((routine) => {
                const isToday = routine.days.includes(dow)
                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => onOpenRoutine(routine.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md',
                      isToday
                        ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                        : 'border-border/60 bg-secondary/20 hover:bg-secondary/40'
                    )}
                  >
                    <div className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg',
                      isToday ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                    )}>
                      <Dumbbell className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {routine.name}
                        </h3>
                        {isToday && (
                          <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{routine.exercises.length} exercises</span>
                        <span>{estimateDuration(routine.exercises)}</span>
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        {DAY_LABELS.map((label, i) => (
                          <span
                            key={i}
                            className={cn(
                              'flex size-5 items-center justify-center rounded text-[0.55rem] font-medium',
                              routine.days.includes(i)
                                ? 'bg-primary/20 text-primary'
                                : 'bg-secondary/60 text-muted-foreground/50'
                            )}
                          >
                            {label.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="mt-12 border-t border-border/40 pt-6">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <Trash2 className="size-4" />
              Danger Zone
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This permanently deletes all your routines and workout data. This cannot be undone.
            </p>
            {!nukeArmed ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setNukeArmed(true)}
              >
                <Trash2 className="size-3.5" />
                Reset All Workout Data
              </Button>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    persist({ routines: [] })
                    setNukeArmed(false)
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNukeArmed(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
function RoutineDetailView({
  routine, config, persist, onBack
}: {
  routine: WorkoutRoutine
  config: WorkoutConfig
  persist: (c: WorkoutConfig) => void
  onBack: () => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(routine.name)
  const [showLibrary, setShowLibrary] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newExerciseSets, setNewExerciseSets] = useState('')

  const updateRoutine = (updater: (r: WorkoutRoutine) => WorkoutRoutine) => {
    persist({
      routines: config.routines.map((r) => (r.id === routine.id ? updater(r) : r))
    })
  }

  const saveName = () => {
    if (name.trim()) {
      updateRoutine((r) => ({ ...r, name: name.trim() }))
    }
    setEditingName(false)
  }

  const toggleDay = (day: number) => {
    updateRoutine((r) => ({
      ...r,
      days: r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day].sort()
    }))
  }

  const removeExercise = (exerciseId: string) => {
    updateRoutine((r) => ({
      ...r,
      exercises: r.exercises.filter((e) => e.id !== exerciseId)
    }))
  }

  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    updateRoutine((r) => {
      const idx = r.exercises.findIndex((e) => e.id === exerciseId)
      if (idx < 0) return r
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= r.exercises.length) return r
      const next = [...r.exercises]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return { ...r, exercises: next }
    })
  }

  const addExercise = () => {
    const n = newExerciseName.trim()
    if (!n) return
    const exercise: WorkoutExercise = {
      id: generateId(),
      name: n,
      sets: newExerciseSets.trim() || '3×10'
    }
    updateRoutine((r) => ({ ...r, exercises: [...r.exercises, exercise] }))
    setNewExerciseName('')
    setNewExerciseSets('')
  }

  const addFromLibrary = (libExercise: LibraryExercise) => {
    const exercise: WorkoutExercise = {
      id: generateId(),
      name: libExercise.name,
      sets: libExercise.defaultSets
    }
    updateRoutine((r) => ({ ...r, exercises: [...r.exercises, exercise] }))
  }

  const deleteRoutine = () => {
    persist({ routines: config.routines.filter((r) => r.id !== routine.id) })
    onBack()
  }

  const daysList = routine.days.map((d) => DAY_FULL[d]).join(', ') || 'No days assigned'

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">Routine</h1>
          <button
            type="button"
            onClick={deleteRoutine}
            className="text-sm text-destructive/80 transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Routine Header */}
        <div className="mb-6">
          {editingName ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                autoFocus
                className="flex-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2"
            >
              <h2 className="text-2xl font-bold text-foreground">{routine.name}</h2>
              <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                edit
              </span>
            </button>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ListChecks className="size-3.5" />
              {routine.exercises.length} exercises
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {estimateDuration(routine.exercises)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {routine.days.length}x/week
            </span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Schedule
          </label>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all',
                  routine.days.includes(i)
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{daysList}</p>
        </div>

        {/* Exercises */}
        <div className="mb-6">
          <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Exercises ({routine.exercises.length})
          </label>

          {routine.exercises.length > 0 ? (
            <div className="space-y-2">
              {routine.exercises.map((exercise, idx) => (
                <div
                  key={exercise.id}
                  className="group flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{exercise.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{exercise.sets}</p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => moveExercise(exercise.id, 'up')}
                      disabled={idx === 0}
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(exercise.id, 'down')}
                      disabled={idx === routine.exercises.length - 1}
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No exercises yet. Add some below.</p>
          )}
        </div>

        {/* Add Exercise */}
        <div className="mb-4 rounded-xl border border-border/60 bg-secondary/20 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Add Exercise
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              placeholder="Exercise name"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <input
              value={newExerciseSets}
              onChange={(e) => setNewExerciseSets(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              placeholder="3×10"
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <Button size="sm" onClick={addExercise}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </div>

        {/* Add from Library */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLibrary(!showLibrary)}
            className="w-full"
          >
            <Library className="size-4" />
            {showLibrary ? 'Hide' : 'Browse'} Exercise Library
            <ChevronDown className={cn('size-4 transition-transform', showLibrary && 'rotate-180')} />
          </Button>

          {showLibrary && (
            <div className="mt-3">
              <InlineExerciseLibrary onAdd={addFromLibrary} existingIds={routine.exercises.map(e => e.name)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Create Routine View ─── */
function CreateRoutineView({
  config, persist, onBack, onCreated
}: {
  config: WorkoutConfig
  persist: (c: WorkoutConfig) => void
  onBack: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [days, setDays] = useState<number[]>([])

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const create = () => {
    const n = name.trim()
    if (!n) return
    const routine: WorkoutRoutine = {
      id: generateId(),
      name: n,
      days,
      exercises: []
    }
    persist({ routines: [...config.routines, routine] })
    onCreated(routine.id)
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">New Routine</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Create Your Routine</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Name it, pick your days, then add exercises from the library.
        </p>

        {/* Name */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Routine Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper Body, Leg Day, HIIT..."
            className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            autoFocus
          />
        </div>

        {/* Days */}
        <div className="mb-8">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Training Days
          </label>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'flex size-11 items-center justify-center rounded-lg border text-xs font-semibold transition-all',
                  days.includes(i)
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {days.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {days.map((d) => DAY_FULL[d]).join(', ')}
            </p>
          )}
        </div>

        <Button onClick={create} disabled={!name.trim()} className="w-full" size="lg">
          <Plus className="size-4" />
          Create Routine
        </Button>
      </div>
    </div>
  )
}

/* ─── Template Library View ─── */
function TemplateLibraryView({
  config, persist, onBack
}: {
  config: WorkoutConfig
  persist: (c: WorkoutConfig) => void
  onBack: () => void
}) {
  const [applied, setApplied] = useState<string | null>(null)

  const categoryIcons: Record<string, typeof Dumbbell> = {
    strength: Dumbbell,
    hypertrophy: Zap,
    cardio: Flame,
    flexibility: RotateCcw,
    bodyweight: Target,
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-500 bg-green-500/10',
    intermediate: 'text-yellow-500 bg-yellow-500/10',
    advanced: 'text-red-500 bg-red-500/10',
  }

  const applyTemplate = (key: string) => {
    const template = TEMPLATES[key]
    if (!template) return
    persist({ routines: template.routines })
    setApplied(key)
    setTimeout(() => onBack(), 1200)
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">Program Templates</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Pro Templates</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          World-class programs designed by elite trainers. Pick one to get started instantly.
        </p>

        <div className="grid gap-3">
          {Object.entries(TEMPLATES).map(([key, template]) => {
            if (key === 'blank') return null
            const Icon = categoryIcons[template.category] ?? Dumbbell
            const isApplied = applied === key

            return (
              <div
                key={key}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isApplied
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/60 bg-secondary/20 hover:bg-secondary/40'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[0.6rem] font-medium', difficultyColors[template.difficulty])}>
                        {template.difficulty}
                      </span>
                      <span className="text-[0.6rem] text-muted-foreground">
                        {template.daysPerWeek}x/week
                      </span>
                      <span className="text-[0.6rem] text-muted-foreground">
                        {template.routines.reduce((sum, r) => sum + r.exercises.length, 0)} exercises
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isApplied ? 'default' : 'outline'}
                    onClick={() => applyTemplate(key)}
                    disabled={isApplied}
                    className="shrink-0"
                  >
                    {isApplied ? <Check className="size-4" /> : 'Use'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Applying a template replaces your current routines.
        </p>
      </div>
    </div>
  )
}

/* ─── Exercise Library View (Full Page) ─── */
function ExerciseLibraryView({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all')

  const filtered = useMemo(() => {
    let results = search ? searchExercises(search) : EXERCISE_LIBRARY
    if (selectedGroup !== 'all') {
      results = results.filter((e) => e.muscleGroup === selectedGroup)
    }
    return results
  }, [search, selectedGroup])

  const grouped = useMemo(() => {
    const map: Partial<Record<MuscleGroup, LibraryExercise[]>> = {}
    for (const ex of filtered) {
      if (!map[ex.muscleGroup]) map[ex.muscleGroup] = []
      map[ex.muscleGroup]!.push(ex)
    }
    return map
  }, [filtered])

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">Exercise Library</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-xl border border-border bg-secondary/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        {/* Muscle group filter */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedGroup('all')}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selectedGroup === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
            )}
          >
            All
          </button>
          {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedGroup === group
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
              )}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>

        {/* Results */}
        <p className="mb-3 text-xs text-muted-foreground">{filtered.length} exercises</p>

        {Object.entries(grouped).map(([group, exercises]) => (
          <div key={group} className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              {MUSCLE_GROUP_LABELS[group as MuscleGroup]}
            </h3>
            <div className="grid gap-1.5">
              {exercises!.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.defaultSets}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-muted-foreground">
                    {EQUIPMENT_LABELS[ex.equipment]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <Search className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No exercises found</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Inline Exercise Library (for Routine Detail) ─── */
function InlineExerciseLibrary({
  onAdd, existingIds
}: {
  onAdd: (exercise: LibraryExercise) => void
  existingIds: string[]
}) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all')

  const filtered = useMemo(() => {
    let results = search ? searchExercises(search) : EXERCISE_LIBRARY
    if (selectedGroup !== 'all') {
      results = results.filter((e) => e.muscleGroup === selectedGroup)
    }
    return results
  }, [search, selectedGroup])

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/10 p-3">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedGroup('all')}
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-medium transition-colors',
            selectedGroup === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          )}
        >
          All
        </button>
        {(Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[]).map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setSelectedGroup(group)}
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-medium transition-colors',
              selectedGroup === group
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            )}
          >
            {MUSCLE_GROUP_LABELS[group]}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {filtered.slice(0, 20).map((ex) => {
          const alreadyAdded = existingIds.includes(ex.name)
          return (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-secondary/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{ex.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] text-muted-foreground">{ex.defaultSets}</span>
                  <span className="text-[0.6rem] text-muted-foreground">•</span>
                  <span className="text-[0.6rem] text-muted-foreground">{EQUIPMENT_LABELS[ex.equipment]}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAdd(ex)}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                  alreadyAdded
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary'
                )}
                aria-label={`Add ${ex.name}`}
              >
                {alreadyAdded ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              </button>
            </div>
          )
        })}
        {filtered.length > 20 && (
          <p className="py-2 text-center text-xs text-muted-foreground">
            Showing 20 of {filtered.length}. Refine your search.
          </p>
        )}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">No exercises found</p>
        )}
      </div>
    </div>
  )
}


/* ─── AI Workout Builder ─── */
function AiWorkoutBuilder({
  config, persist, onBack
}: {
  config: WorkoutConfig
  persist: (c: WorkoutConfig) => void
  onBack: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<WorkoutRoutine[] | null>(null)
  const [refinement, setRefinement] = useState('')

  const buildProgram = async (description: string, currentProgram?: WorkoutRoutine[]) => {
    setLoading(true)
    setError('')

    const body: Record<string, unknown> = { description }
    if (currentProgram && currentProgram.length > 0) {
      body.currentProgram = {
        routines: currentProgram.map((r) => ({
          name: r.name,
          days: r.days,
          exercises: r.exercises.map((e) => ({ name: e.name, sets: e.sets })),
        })),
      }
    }

    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to build program')
      }
      const data = await res.json()

      const routines: WorkoutRoutine[] = (data.routines || []).map(
        (r: { name: string; days: number[]; exercises: { name: string; sets: string }[] }, i: number) => ({
          id: generateId(),
          name: r.name,
          days: r.days,
          exercises: r.exercises.map((e, j) => ({
            id: `ai-${i}-${j}-${Date.now()}`,
            name: e.name,
            sets: e.sets,
          })),
        })
      )

      setPreview(routines)
      setRefinement('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleBuild = () => buildProgram(prompt)
  const handleRefine = () => buildProgram(refinement, preview ?? undefined)

  const handleApply = () => {
    if (!preview) return
    persist({ routines: preview })
    onBack()
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-sm font-semibold text-foreground">AI Workout Builder</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Build Your Program</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Tell me about your goals, equipment, experience, and schedule. I&apos;ll design a program for you.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={6}
          placeholder={"e.g. I have dumbbells at home. I want to train Monday through Friday, about 20-30 minutes. MWF should focus on pushing and legs, Tuesday/Thursday should be pulling and arms. I'm intermediate level."}
          className="mb-4 w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 disabled:opacity-60"
        />

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {!preview && (
          <Button onClick={handleBuild} disabled={loading || !prompt.trim()} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Designing your program...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Build My Program
              </>
            )}
          </Button>
        )}

        {/* Preview */}
        {preview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Check className="size-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Program Ready — {preview.length} {preview.length === 1 ? 'routine' : 'routines'}
              </h3>
            </div>

            {preview.map((routine) => (
              <div key={routine.id} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{routine.name}</h4>
                  <div className="flex gap-1">
                    {routine.days.map((d) => (
                      <span key={d} className="flex size-6 items-center justify-center rounded bg-primary/20 text-[0.55rem] font-medium text-primary">
                        {DAY_LABELS[d]}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="space-y-1">
                  {routine.exercises.map((ex, i) => (
                    <li key={ex.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-[0.6rem] font-bold text-primary">{i + 1}</span>
                        {ex.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{ex.sets}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleApply} className="flex-1" size="lg">
                <Check className="size-4" />
                Use This Program
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)} size="lg">
                Start Over
              </Button>
            </div>

            {/* Refinement input */}
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Want to change something? Tell me what to adjust.
              </p>
              <div className="flex gap-2">
                <input
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refinement.trim() && handleRefine()}
                  disabled={loading}
                  placeholder="e.g. Swap tricep exercises for more shoulder work"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 disabled:opacity-60"
                />
                <Button size="sm" onClick={handleRefine} disabled={loading || !refinement.trim()}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              This will replace your current routines. You can also edit manually after applying.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
