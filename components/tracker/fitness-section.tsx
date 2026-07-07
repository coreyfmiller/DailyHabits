'use client'

import { Dumbbell, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { HabitCheckbox } from './primitives'

type Lift = { id: number; text: string }

export function FitnessSection({
  gymShower,
  onToggleGymShower,
}: {
  gymShower: boolean
  onToggleGymShower: (v: boolean) => void
}) {
  const [draft, setDraft] = useState('')
  const [lifts, setLifts] = useLocalStorage<Lift[]>('lifts', [])

  const addLift = () => {
    const text = draft.trim()
    if (!text) return
    setLifts((prev) => [...prev, { id: Date.now(), text }])
    setDraft('')
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Dumbbell className="size-4 text-primary" />
          Weight training log
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addLift()
            }}
            placeholder="e.g. Bench press 4×8 @ 80kg"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button size="sm" onClick={addLift}>
            <Plus className="size-4" />
            Add set
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
        checked={gymShower}
        onChange={onToggleGymShower}
        label="Post-workout shower"
        hint="Rinse off & refresh"
      />
    </div>
  )
}
