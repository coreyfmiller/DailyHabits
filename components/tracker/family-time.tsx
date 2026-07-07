'use client'

import { Check, Heart, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'

type Activity = { id: number; text: string; done: boolean }

const SUGGESTIONS = ['Dinner together', 'Walk outside', 'Read a story', 'Board game']

export function FamilyTime() {
  const [draft, setDraft] = useState('')
  const [activities, setActivities] = useLocalStorage<Activity[]>('family-activities', [])

  const add = (text: string) => {
    const value = text.trim()
    if (!value) return
    setActivities((prev) => [...prev, { id: Date.now(), text: value, done: false }])
    setDraft('')
  }

  const toggle = (id: number) =>
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)))

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) add(draft)
          }}
          placeholder="Log a family activity"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <Button size="sm" onClick={() => add(draft)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            + {s}
          </button>
        ))}
      </div>

      {activities.length > 0 && (
        <ul className="grid gap-1.5">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() => toggle(a.id)}
                className="flex min-w-0 items-center gap-2 text-left"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    a.done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  <Check className={`size-3.5 ${a.done ? 'opacity-100' : 'opacity-0'}`} />
                </span>
                <span
                  className={`min-w-0 truncate ${
                    a.done ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {a.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActivities((prev) => prev.filter((x) => x.id !== a.id))}
                className="text-muted-foreground transition-colors hover:text-destructive"
                aria-label={`Remove ${a.text}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Heart className="size-3.5 text-primary" />
        Phones away — presence over productivity.
      </p>
    </div>
  )
}
