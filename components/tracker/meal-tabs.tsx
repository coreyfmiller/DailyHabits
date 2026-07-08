'use client'

import { Loader2, Sparkles, Timer, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { getNutritionConfig, isInEatingWindow, timeUntilWindow, formatTime12 } from '@/lib/nutrition-config'
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

const MEAL_TAG_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  lunch: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  dinner: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  snack: 'bg-green-500/15 text-green-600 dark:text-green-400',
  drink: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

function getRecentMeals(): MealEntry[] {
  if (typeof window === 'undefined') return []
  const now = new Date()
  const entries: MealEntry[] = []

  for (let i = 1; i < 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    // Check unified key and legacy per-slot keys
    for (const slot of ['meals', 'meals-breakfast', 'meals-lunch', 'meals-supper']) {
      try {
        const raw = localStorage.getItem(`daily-habits:${key}:${slot}`)
        if (raw) {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr)) entries.push(...arr)
        }
      } catch {}
    }
  }

  const seen = new Set<string>()
  const unique: MealEntry[] = []
  for (const entry of entries) {
    const norm = entry.title?.toLowerCase().trim()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    unique.push(entry)
    if (unique.length >= 6) break
  }
  return unique
}

export function MealTabs() {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useLocalStorage<MealEntry[]>('meals', [])
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([])

  useEffect(() => {
    setRecentMeals(getRecentMeals())
  }, [])

  const addQuickMeal = (meal: MealEntry) => {
    setEntries((prev) => [
      { ...meal, id: Date.now(), at: new Date().toISOString() },
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
          mealType: data.mealType ?? 'snack',
          items: Array.isArray(data.items) ? data.items : [],
          estimatedCalories: typeof data.estimatedCalories === 'number' ? data.estimatedCalories : null,
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
          mealType: 'snack',
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

  const totalCalories = entries.reduce((sum, e) => sum + (e.estimatedCalories ?? 0), 0)

  // Nutrition config awareness
  const [nutritionConfig] = useState(getNutritionConfig)
  const hasFasting = nutritionConfig.fasting !== 'none'
  const windowOpen = hasFasting ? isInEatingWindow(nutritionConfig) : true
  const untilWindow = hasFasting && !windowOpen ? timeUntilWindow(nutritionConfig) : ''
  const calorieTarget = nutritionConfig.calorieTarget

  return (
    <div className="grid gap-3">
      {/* Fasting window status */}
      {hasFasting && (
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
          windowOpen
            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
            : 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
        }`}>
          <Timer className="size-4" />
          {windowOpen ? (
            <span>
              Eating window open — closes at {formatTime12(nutritionConfig.fastingWindowEnd)}
            </span>
          ) : (
            <span>
              Fasting — window opens in {untilWindow}
            </span>
          )}
        </div>
      )}
      {/* Quick-add from recent meals */}
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

      {/* Input */}
      <div className="flex flex-col gap-2">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
              e.preventDefault()
              logMeal()
            }
          }}
          rows={2}
          placeholder='Describe what you ate — e.g. "Grilled chicken with rice and a glass of water"'
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">⌘/Ctrl + Enter to log</span>
          <Button size="sm" onClick={logMeal} disabled={loading || !description.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? 'Analyzing…' : 'Log with AI'}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Calorie tracking */}
      {(totalCalories > 0 || calorieTarget > 0) && (
        <div className="rounded-lg bg-primary/10 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-medium text-primary">
              ~{totalCalories} kcal
            </span>
            {calorieTarget > 0 && (
              <span className="text-xs text-muted-foreground">
                / {calorieTarget} target
              </span>
            )}
          </div>
          {calorieTarget > 0 && (
            <div className="mt-1.5 h-1.5 rounded-full bg-primary/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min((totalCalories / calorieTarget) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Food log */}
      {entries.length > 0 && (
        <ul className="grid gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border/70 bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Utensils className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{entry.title}</span>
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium capitalize ${MEAL_TAG_COLORS[entry.mealType] ?? MEAL_TAG_COLORS.snack}`}>
                      {entry.mealType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeOfDay(new Date(entry.at))}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {entry.estimatedCalories != null && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-xs text-primary">
                      ~{entry.estimatedCalories}
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
                    <span key={i} className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              )}
              {entry.healthNote && (
                <p className="mt-2 text-xs text-muted-foreground">{entry.healthNote}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
