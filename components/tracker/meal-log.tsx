'use client'

import { Loader2, Sparkles, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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

function getRecentMeals(): MealEntry[] {
  if (typeof window === 'undefined') return []

  const now = new Date()
  const entries: MealEntry[] = []

  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    for (const slot of ['meals-breakfast', 'meals-lunch', 'meals-supper']) {
      try {
        const raw = localStorage.getItem(`daily-habits:${key}:${slot}`)
        if (raw) {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr)) {
            entries.push(...arr)
          }
        }
      } catch {}
    }
  }

  // Deduplicate by title, keep most recent (first found since we iterate newest first)
  const seen = new Set<string>()
  const unique: MealEntry[] = []
  for (const entry of entries) {
    const normalizedTitle = entry.title?.toLowerCase().trim()
    if (!normalizedTitle || seen.has(normalizedTitle)) continue
    seen.add(normalizedTitle)
    unique.push(entry)
    if (unique.length >= 5) break
  }

  return unique
}

export function MealLog({ mealSlot }: { mealSlot: 'breakfast' | 'lunch' | 'supper' }) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useLocalStorage<MealEntry[]>(`meals-${mealSlot}`, [])
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([])

  useEffect(() => {
    setRecentMeals(getRecentMeals())
  }, [])

  const addQuickMeal = (meal: MealEntry) => {
    setEntries((prev) => [
      {
        ...meal,
        id: Date.now(),
        at: new Date().toISOString(),
        mealType: mealSlot,
      },
      ...prev,
    ])
  }

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
      {/* Recent meals quick-add */}
      {recentMeals.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {recentMeals.map((meal) => (
            <button
              key={meal.title}
              type="button"
              onClick={() => addQuickMeal(meal)}
              className="shrink-0 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-primary/10 hover:border-primary/30"
            >
              {meal.title}
            </button>
          ))}
        </div>
      )}

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
                <div className="flex shrink-0 items-center gap-2">
                  {entry.estimatedCalories != null && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-xs text-primary">
                      ~{entry.estimatedCalories} kcal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${entry.title}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
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
