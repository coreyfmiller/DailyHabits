'use client'

import { Loader2, Sparkles, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { formatTimeOfDay } from './use-now'

type MealEntry = {
  id: number
  at: string
  description: string
  title: string
  mealType: string
  items: string[]
  estimatedCalories: number | null
  healthNote: string | null
}

const PLACEHOLDERS: Record<string, string> = {
  breakfast: 'e.g. "Oatmeal with berries and a black coffee"',
  lunch: 'e.g. "Grilled chicken salad with avocado and an iced tea"',
  supper: 'e.g. "Salmon with rice and roasted veggies"',
}

export function MealLog({ mealSlot }: { mealSlot: 'breakfast' | 'lunch' | 'supper' }) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useLocalStorage<MealEntry[]>(`meals-${mealSlot}`, [])

  const logMeal = async () => {
    const text = description.trim()
    if (!text || loading) return

    setLoading(true)
    setError(null)
    const at = new Date().toISOString()

    try {
      const res = await fetch('/api/meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      })
      if (!res.ok) throw new Error('request failed')
      const data = await res.json()

      setEntries((prev) => [
        {
          id: Date.now(),
          at,
          description: text,
          title: data.title ?? text,
          mealType: data.mealType ?? mealSlot,
          items: Array.isArray(data.items) ? data.items : [],
          estimatedCalories:
            typeof data.estimatedCalories === 'number' ? data.estimatedCalories : null,
          healthNote: data.healthNote ?? null,
        },
        ...prev,
      ])
      setDescription('')
    } catch {
      setEntries((prev) => [
        {
          id: Date.now(),
          at,
          description: text,
          title: text,
          mealType: mealSlot,
          items: [],
          estimatedCalories: null,
          healthNote: null,
        },
        ...prev,
      ])
      setDescription('')
      setError('Logged without AI analysis (assistant unavailable).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              (e.metaKey || e.ctrlKey) &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault()
              logMeal()
            }
          }}
          rows={2}
          placeholder={PLACEHOLDERS[mealSlot] ?? 'Describe what you ate'}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">⌘/Ctrl + Enter to log</span>
          <Button size="sm" onClick={logMeal} disabled={loading || !description.trim()}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? 'Analyzing…' : 'Log with AI'}
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      {entries.length > 0 && (
        <ul className="grid gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border/70 bg-secondary/40 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Utensils className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{entry.title}</span>
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {entry.mealType} · {formatTimeOfDay(new Date(entry.at))}
                  </p>
                </div>
                {entry.estimatedCalories != null && (
                  <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 font-mono text-xs text-primary">
                    ~{entry.estimatedCalories} kcal
                  </span>
                )}
              </div>

              {entry.items.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.items.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {entry.healthNote ? (
                <p className="mt-2 text-xs text-muted-foreground">{entry.healthNote}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
