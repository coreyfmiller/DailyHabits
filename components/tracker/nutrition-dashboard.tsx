'use client'

import { Bookmark, ChevronDown, Droplets, Flame, Loader2, Sparkles, Timer, Utensils, X } from 'lucide-react'
import { useState } from 'react'
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

const SAVED_MEALS_KEY = 'saved-meals'

type SavedMeal = {
  id: string
  title: string
  mealType: string
  estimatedCalories: number | null
  items: string[]
}

function getSavedMeals(): SavedMeal[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_MEALS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function setSavedMeals(meals: SavedMeal[]) {
  try { localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(meals)) } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NutritionDashboard() {
  const [expanded, setExpanded] = useState(false)
  const [entries, setEntries] = useLocalStorage<MealEntry[]>('meals', [])
  const [waterGlasses, setWaterGlasses] = useLocalStorage<number>('water-glasses', 0)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(getSavedMeals)

  const [nutritionConfig] = useState<NutritionConfig>(getNutritionConfig)
  const hasFasting = nutritionConfig.fasting !== 'none'
  const windowOpen = hasFasting ? isInEatingWindow(nutritionConfig) : true
  const untilWindow = hasFasting && !windowOpen ? timeUntilWindow(nutritionConfig) : ''
  const calorieTarget = nutritionConfig.calorieTarget
  const totalCalories = entries.reduce((sum, e) => sum + (e.estimatedCalories ?? 0), 0)
  const caloriePercent = calorieTarget > 0 ? Math.min((totalCalories / calorieTarget) * 100, 100) : 0

  const saveMeal = (entry: MealEntry) => {
    const saved: SavedMeal = {
      id: `sm-${Date.now()}`,
      title: entry.title,
      mealType: entry.mealType,
      estimatedCalories: entry.estimatedCalories,
      items: entry.items,
    }
    const updated = [...savedMeals, saved]
    setSavedMeals(updated)
    setSavedMeals(updated)
    setSavedMealsStorage(updated)
  }

  const removeSavedMeal = (id: string) => {
    const updated = savedMeals.filter((m) => m.id !== id)
    setSavedMeals(updated)
    setSavedMealsStorage(updated)
  }

  const setSavedMealsStorage = (meals: SavedMeal[]) => {
    try { localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(meals)) } catch {}
  }

  const addFromSaved = (meal: SavedMeal) => {
    setEntries((prev) => [{
      id: Date.now(),
      at: new Date().toISOString(),
      description: meal.title,
      title: meal.title,
      mealType: meal.mealType,
      items: meal.items,
      estimatedCalories: meal.estimatedCalories,
      healthNote: null,
    }, ...prev])
  }

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

          {/* Saved meals quick-add */}
          {savedMeals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Saved meals</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {savedMeals.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => addFromSaved(meal)}
                    className="shrink-0 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-primary/10 hover:border-primary/30"
                    title={meal.estimatedCalories ? `~${meal.estimatedCalories} kcal` : undefined}
                  >
                    {meal.title}
                  </button>
                ))}
              </div>
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
                    <div className="flex shrink-0 items-center gap-1 mt-0.5">
                      {!savedMeals.some((s) => s.title === entry.title) && (
                        <button
                          type="button"
                          onClick={() => saveMeal(entry)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`Save ${entry.title}`}
                          title="Save as quick-add"
                        >
                          <Bookmark className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${entry.title}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
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
