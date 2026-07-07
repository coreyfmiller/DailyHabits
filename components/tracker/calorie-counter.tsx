'use client'

import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

type MealEntry = {
  id: number
  estimatedCalories: number | null
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalories(): number {
  if (typeof window === 'undefined') return 0
  const prefix = `daily-habits:${todayKey()}`
  let total = 0
  for (const slot of ['meals-breakfast', 'meals-lunch', 'meals-supper']) {
    try {
      const raw = localStorage.getItem(`${prefix}:${slot}`)
      if (raw) {
        const entries: MealEntry[] = JSON.parse(raw)
        total += entries.reduce((sum, e) => sum + (e.estimatedCalories ?? 0), 0)
      }
    } catch {}
  }
  return total
}

export function CalorieCounter() {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // Initial read
    setTotal(getCalories())

    // Poll every 2 seconds to pick up changes from other components
    const id = setInterval(() => setTotal(getCalories()), 2000)
    return () => clearInterval(id)
  }, [])

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
