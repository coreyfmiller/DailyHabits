'use client'

import { Dumbbell, ChevronRight } from 'lucide-react'

/**
 * Settings panel entry point for workouts.
 * The full workout management lives at /app/workouts — this just links there.
 */
export function WorkoutSetup() {
  return (
    <a
      href="/app/workouts"
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
    >
      <Dumbbell className="size-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Workout Manager</p>
        <p className="text-xs text-muted-foreground">
          Build routines, browse templates, or let AI create your program.
        </p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </a>
  )
}
