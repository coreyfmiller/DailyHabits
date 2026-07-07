'use client'

import { Flame } from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'

type MealEntry = {
  id: number
  estimatedCalories: number | null
}

export function CalorieCounter() {
  const [breakfast] = useLocalStorage<MealEntry[]>('meals-breakfast', [])
  const [lunch] = useLocalStorage<MealEntry[]>('meals-lunch', [])
  const [supper] = useLocalStorage<MealEntry[]>('meals-supper', [])

  const total = [...breakfast, ...lunch, ...supper].reduce(
    (sum, entry) => sum + (entry.estimatedCalories ?? 0),
    0
  )

  if (total === 0) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1">
      <Flame className="size-3.5 text-primary" />
      <span className="font-mono text-xs font-medium tabular-nums text-primary">
        ~{total} kcal
      </span>
    </div>
  )
}
