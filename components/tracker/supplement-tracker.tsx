'use client'

import { Pill, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { HabitCheckbox } from './primitives'

// ─── Types ────────────────────────────────────────────────────────────────────

type Supplement = { id: string; name: string }

const STORAGE_KEY = 'supplements'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredSupplements(): Supplement[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredSupplements(supplements: Supplement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(supplements))
  } catch {}
}

// ─── SupplementChecklist ──────────────────────────────────────────────────────

export function SupplementChecklist() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [done, setDone] = useLocalStorage<string[]>('supplements-done', [])

  useEffect(() => {
    setSupplements(getStoredSupplements())
  }, [])

  if (supplements.length === 0) return null

  const toggle = (id: string) => {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="grid gap-2">
      {supplements.map((s) => (
        <HabitCheckbox
          key={s.id}
          checked={done.includes(s.id)}
          onChange={() => toggle(s.id)}
          label={s.name}
          hint="Daily supplement"
        />
      ))}
    </div>
  )
}

// ─── SupplementManager ────────────────────────────────────────────────────────

export function SupplementManager() {
  const [supplements, setSupplements] = useState<Supplement[]>(getStoredSupplements)
  const [draft, setDraft] = useState('')

  const save = useCallback((updated: Supplement[]) => {
    setSupplements(updated)
    setStoredSupplements(updated)
  }, [])

  const add = () => {
    const name = draft.trim()
    if (!name) return
    const id = `sup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    save([...supplements, { id, name }])
    setDraft('')
  }

  const remove = (id: string) => save(supplements.filter((s) => s.id !== id))

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Supplements</h3>
        </div>
      </div>

      {supplements.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No supplements configured. Add your daily supplements below.
        </p>
      )}

      {supplements.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5"
        >
          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
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
    </div>
  )
}
