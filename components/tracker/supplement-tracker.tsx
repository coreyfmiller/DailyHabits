'use client'

import { Pill, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'
import { HabitCheckbox } from './primitives'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SupplementTime = 'morning' | 'midday' | 'evening'

type Supplement = { id: string; name: string; time: SupplementTime }

const STORAGE_KEY = 'supplements'

const TIME_LABELS: Record<SupplementTime, string> = {
  morning: 'Morning',
  midday: 'Midday',
  evening: 'Evening',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredSupplements(): Supplement[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Migrate old format (no time field) — default to morning
    return parsed.map((s: Supplement & { time?: SupplementTime }) => ({
      ...s,
      time: s.time ?? 'morning',
    }))
  } catch {
    return []
  }
}

function setStoredSupplements(supplements: Supplement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(supplements))
  } catch {}
}

// ─── SupplementChecklist (filtered by time) ───────────────────────────────────

export function SupplementChecklist({ time }: { time: SupplementTime }) {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [done, setDone] = useLocalStorage<string[]>('supplements-done', [])

  useEffect(() => {
    setSupplements(getStoredSupplements().filter((s) => s.time === time))
  }, [time])

  if (supplements.length === 0) return null

  const toggle = (id: string) => {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Pill className="size-3.5" />
        {TIME_LABELS[time]} supplements
      </div>
      {supplements.map((s) => (
        <HabitCheckbox
          key={s.id}
          checked={done.includes(s.id)}
          onChange={() => toggle(s.id)}
          label={s.name}
        />
      ))}
    </div>
  )
}

// ─── SupplementManager ────────────────────────────────────────────────────────

export function SupplementManager() {
  const [supplements, setSupplements] = useState<Supplement[]>(getStoredSupplements)
  const [draft, setDraft] = useState('')
  const [draftTime, setDraftTime] = useState<SupplementTime>('morning')

  const save = useCallback((updated: Supplement[]) => {
    setSupplements(updated)
    setStoredSupplements(updated)
  }, [])

  const add = () => {
    const name = draft.trim()
    if (!name) return
    const id = `sup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    save([...supplements, { id, name, time: draftTime }])
    setDraft('')
  }

  const remove = (id: string) => save(supplements.filter((s) => s.id !== id))

  const grouped = {
    morning: supplements.filter((s) => s.time === 'morning'),
    midday: supplements.filter((s) => s.time === 'midday'),
    evening: supplements.filter((s) => s.time === 'evening'),
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Pill className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Supplements</h3>
      </div>

      {supplements.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No supplements configured. Add your daily supplements below.
        </p>
      )}

      {(['morning', 'midday', 'evening'] as const).map((time) => {
        if (grouped[time].length === 0) return null
        return (
          <div key={time}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">{TIME_LABELS[time]}</p>
            {grouped[time].map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 mb-1.5"
              >
                <p className="text-sm text-foreground truncate">{s.name}</p>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )
      })}

      {/* Add form */}
      <div className="grid gap-2">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) add()
            }}
            placeholder="e.g. Vitamin D, Fish Oil, Creatine"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button size="sm" onClick={add} disabled={!draft.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        <div className="flex gap-1.5">
          {(['morning', 'midday', 'evening'] as const).map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setDraftTime(time)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                draftTime === time
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {TIME_LABELS[time]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
