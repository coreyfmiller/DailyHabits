'use client'

import { Check, Plus, Settings2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'
import { RecurringTasksChecklist } from './recurring-tasks'
import { SupplementChecklist } from './supplement-tracker'

// ─── Types ────────────────────────────────────────────────────────────────────

type RitualItem = { id: string; label: string; hint?: string }

const STORAGE_KEY = 'morning-routine-items'

// ─── Persistence ──────────────────────────────────────────────────────────────

function getStoredItems(): RitualItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function setStoredItems(items: RitualItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MorningRoutine() {
  const [items, setItems] = useState<RitualItem[]>(getStoredItems)
  const [checkedIds, setCheckedIds] = useLocalStorage<string[]>('routine-checked', [])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  // If no items configured, show first-time setup
  const isEmpty = items.length === 0 && !editing

  const persist = useCallback((updated: RitualItem[]) => {
    setItems(updated)
    setStoredItems(updated)
  }, [])

  const addItem = () => {
    const label = draft.trim()
    if (!label) return
    const id = `ri-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    persist([...items, { id, label }])
    setDraft('')
  }

  const removeItem = (id: string) => {
    persist(items.filter((i) => i.id !== id))
    setCheckedIds((prev) => prev.filter((cid) => cid !== id))
  }

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const completedCount = items.filter((i) => checkedIds.includes(i.id)).length

  return (
    <div className="grid gap-4">
      {/* Configured habits */}
      {items.length > 0 && !editing && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{items.length} done
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="size-3" />
              Edit
            </button>
          </div>
          <div className="grid gap-1.5">
            {items.map((item) => {
              const checked = checkedIds.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className="flex w-full items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    )}
                  >
                    <Check className={cn('size-3.5', checked ? 'opacity-100' : 'opacity-0')} />
                  </span>
                  <span className={cn(
                    'text-sm',
                    checked ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state / Setup */}
      {isEmpty && (
        <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
          <p className="text-sm text-muted-foreground">No routine items configured yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add things like coffee, medication, make bed — whatever starts your day right.
          </p>
          <Button size="sm" className="mt-3" onClick={() => setEditing(true)}>
            <Plus className="size-4" />
            Set Up Routine
          </Button>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Configure Routine
            </span>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Done
            </button>
          </div>

          {items.length > 0 && (
            <ul className="mb-3 grid gap-1.5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm text-foreground"
                >
                  <span>{item.label}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${item.label}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) addItem()
              }}
              placeholder="e.g. Coffee, Medication, Make bed..."
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <Button size="sm" onClick={addItem} disabled={!draft.trim()}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Morning supplements */}
      <SupplementChecklist time="morning" />

      {/* Recurring tasks */}
      <RecurringTasksChecklist />
    </div>
  )
}
