'use client'

import { Check, Footprints } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '@/lib/use-local-storage'

export function EveningWalk() {
  const [walked, setWalked] = useLocalStorage('walk-done', false)
  const [note, setNote] = useLocalStorage('walk-note', '')
  const [showNote, setShowNote] = useState(false)

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => setWalked(!walked)}
        className="flex w-full items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
      >
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            walked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background'
          }`}
        >
          <Check className={`size-3.5 ${walked ? 'opacity-100' : 'opacity-0'}`} />
        </span>
        <span className={`text-sm ${walked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          Went for a walk
        </span>
      </button>

      {walked && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Footprints className="size-3.5 text-primary" />
          <span>Walk complete.</span>
          {!showNote && !note && (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="text-primary hover:underline"
            >
              Add note
            </button>
          )}
        </div>
      )}

      {(showNote || note) && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Duration, distance, or how it felt..."
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
      )}
    </div>
  )
}
