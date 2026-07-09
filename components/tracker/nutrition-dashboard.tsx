'use client'

import { ChevronDown, Droplets, Flame, Loader2, Pill, Plus, Sparkles, Timer, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'
import {
  getNutritionConfig, isInEatingWindow, timeUntilWindow, formatTime12,
  type NutritionConfig,
} from '@/lib/nutrition-config'
import { formatTimeOfDay } from './use-now'

// ─── Types ────────────────────────────────────────────────────────────────────

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
    if (unique.length >= 5) break
  }
  return unique
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NutritionDashboard() {
  const [expanded, setExpanded] = useState(false)
  const [entries, setEntries] = useLocalStorage<MealEntry[]>('meals', [])
  const [waterGlasses, setWaterGlasses] = useLocalStorage<number>('water-glasses', 0)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentMeals, setRecentMeals] = useState<MealEntry[]>([])

  const [nutritionConfig] = useState<NutritionConfig>(getNutritionConfig)
  const hasFasting = nutritionConfig.fasting !== 'none'
  const windowOpen = hasFasting ? isInEatingWindow(nutritionConfig) : true
  const untilWindow = hasFasting && !windowOpen ? timeUntilWindow(nutritionConfig) : ''
  const calorieTarget = nutritionConfig.calorieTarget
  const totalCalories = entries.reduce((sum, e) => sum + (e.estimatedCalories ?? 0), 0)
  const caloriePercent = calorieTarget > 0 ? Math.min((totalCalories / calorieTarget) * 100, 100) : 0

  useEffect(() => {
    setRecentMeals(getRecentMeals())
  }, [])

  // Smart placeholder based on time of day
  const hour = new Date().getHours()
  const placeholder = hour < 11
    ? 'What did you have for breakfast?'
    : hour < 15
    ? 'What are you having for lunch?'
    : hour < 20
    ? "What's for dinner?"
    : 'Late snack?'

  const logMeal = async () => {
    const text = description.trim()
    if (!text || loading) return
    setLoading(true)
    const at = new Date().toISOString()
    try {
      const res = await fetch('/api/meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      })
      if (!res.ok) throw new Error('request failed')
      const data = await res.json()
      setEntries((prev) => [{
        id: Date.now(), at, description: text,
        title: data.title ?? text,
        mealType: data.mealType ?? 'snack',
        items: Array.isArray(data.items) ? data.items : [],
        estimatedCalories: typeof data.estimatedCalories === 'number' ? data.estimatedCalories : null,
        healthNote: data.healthNote ?? null,
      }, ...prev])
      setDescription('')
    } catch {
      setEntries((prev) => [{
        id: Date.now(), at, description: text, title: text,
        mealType: 'snack', items: [], estimatedCalories: null, healthNote: null,
      }, ...prev])
      setDescription('')
    } finally {
      setLoading(false)
    }
  }

  const addQuickMeal = (meal: MealEntry) => {
    setEntries((prev) => [{ ...meal, id: Date.now(), at: new Date().toISOString() }, ...prev])
  }

  return (
    <div className="mb-6 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Collapsed card — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {/* Calorie ring */}
        <div className="relative flex size-12 shrink-0 items-center justify-center">
          <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="text-secondary" />
            {calorieTarget > 0 && (
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeDasharray={`${caloriePercent} ${100 - caloriePercent}`}
                strokeLinecap="round"
                className="text-primary transition-all duration-500" />
            )}
          </svg>
          <Flame className="absolute size-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {totalCalories > 0 ? `${totalCalories} kcal` : 'No meals yet'}
            </span>
            {calorieTarget > 0 && (
              <span className="text-xs text-muted-foreground">/ {calorieTarget}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {hasFasting && (
              <span className={cn('text-xs font-medium', windowOpen ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>
                {windowOpen ? '● Window open' : `● Fasting · ${untilWindow}`}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'meal' : 'meals'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Droplets className="size-3" />
              {waterGlasses}/8
            </span>
          </div>
        </div>

        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
      </button>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-border/60 p-4 space-y-4">
          {/* Fasting bar */}
          {hasFasting && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
              <Timer className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Eating window: {formatTime12(nutritionConfig.fastingWindowStart)} – {formatTime12(nutritionConfig.fastingWindowEnd)}
              </span>
            </div>
          )}

          {/* Quick add from recent */}
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

          {/* Log input */}
          <div className="flex gap-2">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  logMeal()
                }
              }}
              placeholder={placeholder}
              disabled={loading}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 disabled:opacity-60"
            />
            <Button size="sm" onClick={logMeal} disabled={loading || !description.trim()}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            </Button>
          </div>

          {/* Water tracker inline */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-blue-500" />
              <span className="text-sm text-foreground">{waterGlasses}/8 glasses</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWaterGlasses((v) => Math.max(0, v - 1))}
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                –
              </button>
              <button
                type="button"
                onClick={() => setWaterGlasses((v) => v + 1)}
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Calorie progress detail */}
          {calorieTarget > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{totalCalories} kcal consumed</span>
                <span>{Math.max(0, calorieTarget - totalCalories)} remaining</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    caloriePercent >= 100 ? 'bg-destructive' : 'bg-primary'
                  )}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Food log */}
          {entries.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Today&apos;s log</p>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{entry.title}</span>
                        <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[0.55rem] font-medium capitalize', MEAL_TAG_COLORS[entry.mealType] ?? MEAL_TAG_COLORS.snack)}>
                          {entry.mealType}
                        </span>
                      </div>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {formatTimeOfDay(new Date(entry.at))}
                        {entry.estimatedCalories ? ` · ~${entry.estimatedCalories} kcal` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                      aria-label={`Remove ${entry.title}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">
              Nothing logged yet. Describe what you ate above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
