'use client'

import { Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalories(): number {
  if (typeof window === 'undefined') return 0
  const prefix = `daily-habits:${todayKey()}`
  let total = 0

  // Check unified meals key
  try {
    const raw = localStorage.getItem(`${prefix}:meals`)
    if (raw) {
      const entries = JSON.parse(raw)
      if (Array.isArray(entries)) {
        for (const e of entries) {
          if (e && typeof e.estimatedCalories === 'number' && e.estimatedCalories > 0) {
            total += e.estimatedCalories
          }
        }
      }
    }
  } catch {}

  // Also check legacy per-slot keys for backward compat
  for (const slot of ['meals-breakfast', 'meals-lunch', 'meals-supper']) {
    try {
      const raw = localStorage.getItem(`${prefix}:${slot}`)
      if (raw) {
        const entries = JSON.parse(raw)
        if (Array.isArray(entries)) {
          for (const e of entries) {
            if (e && typeof e.estimatedCalories === 'number' && e.estimatedCalories > 0) {
              total += e.estimatedCalories
            }
          }
        }
      }
    } catch {}
  }

  return total
}

export function CalorieCounter() {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setTotal(getCalories())
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
