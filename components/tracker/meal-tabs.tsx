'use client'

import { Utensils } from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'

type MealEntry = {
  id: number
  title: string
  estimatedCalories: number | null
}

/**
 * Simplified meals block for the timeline.
 * Full meal logging UI lives in the NutritionDashboard above the timeline.
 * This just shows a summary of what's been logged today.
 */
export function MealTabs() {
  const [entries] = useLocalStorage<MealEntry[]>('meals', [])
  const totalCalories = entries.reduce((sum, e) => sum + (e.estimatedCalories ?? 0), 0)

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Utensils className="size-4" />
        <span>No meals logged yet. Use the nutrition card above to log food.</span>
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {entries.length} {entries.length === 1 ? 'meal' : 'meals'} logged
        </span>
        {totalCalories > 0 && (
          <span className="font-mono text-xs text-primary">~{totalCalories} kcal</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entries.map((entry) => (
          <span
            key={entry.id}
            className="rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-foreground"
          >
            {entry.title}
          </span>
        ))}
      </div>
    </div>
  )
}
