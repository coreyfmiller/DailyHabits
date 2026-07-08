'use client'

import { Check, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'

type CheckItem = { id: number; text: string; done: boolean }

/**
 * A generic, configurable timeline block.
 * Renders a notes field and a user-defined checklist.
 * Works for any block type that doesn't need specialized UI.
 */
export function GenericBlock({ id }: { id: string }) {
  const [items, setItems] = useLocalStorage<CheckItem[]>(`generic-${id}-items`, [])
  const [notes, setNotes] = useLocalStorage<string>(`generic-${id}-notes`, '')
  const [draft, setDraft] = useState('')

  const addItem = () => {
    const text = draft.trim()
    if (!text) return
    setItems((prev) => [...prev, { id: Date.now(), text, done: false }])
    setDraft('')
  }

  const toggleItem = (itemId: number) =>
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)))

  const removeItem = (itemId: number) =>
    setItems((prev) => prev.filter((i) => i.id !== itemId))

  const completedCount = items.filter((i) => i.done).length

  return (
    <div className="grid gap-3">
      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Notes for this block..."
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
      />

      {/* Checklist */}
      {items.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Checklist</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">
              {completedCount}/{items.length}
            </span>
          </div>
          <ul className="grid gap-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex flex-1 items-center gap-3 rounded-md bg-secondary/40 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/60"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                      item.done
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Check className={`size-3.5 ${item.done ? 'opacity-100' : 'opacity-0'}`} />
                  </span>
                  <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                    {item.text}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${item.text}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to checklist */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addItem()
          }}
          placeholder="Add a task..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <Button size="sm" onClick={addItem} disabled={!draft.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}
