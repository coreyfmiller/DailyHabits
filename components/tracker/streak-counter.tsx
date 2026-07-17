'use client'

import { useEffect, useState } from 'react'

type StreakData = { count: number; lastDate: string; best: number }

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isDayActive(day: string): boolean {
  if (typeof window === 'undefined') return false
  const prefix = `daily-habits:${day}`
  let score = 0

  try { const v = localStorage.getItem(`${prefix}:meals`); if (v && JSON.parse(v).length > 0) score++ } catch {}
  try { const v = localStorage.getItem(`${prefix}:water-glasses`); if (v && JSON.parse(v) >= 4) score++ } catch {}
  try { const v = localStorage.getItem(`${prefix}:walk-done`); if (v && JSON.parse(v)) score++ } catch {}
  try { const v = localStorage.getItem(`${prefix}:routine-checked`); if (v && JSON.parse(v).length > 0) score++ } catch {}

  return score >= 2  // At least 2 out of 4 activities = active day
}

function computeStreak(): StreakData {
  const stored = localStorage.getItem('streak-data')
  let streak: StreakData = { count: 0, lastDate: '', best: 0 }
  if (stored) {
    try { streak = { best: 0, ...JSON.parse(stored) } } catch {}
  }

  const today = todayKey()
  if (streak.lastDate === today) return streak

  // Count backwards from yesterday
  let count = 0
  const d = new Date()
  d.setDate(d.getDate() - 1)

  while (true) {
    if (isDayActive(dateKey(d))) {
      count++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  // Add today if active
  if (isDayActive(today)) count++

  streak.count = count
  streak.lastDate = today
  streak.best = Math.max(streak.best, count)

  localStorage.setItem('streak-data', JSON.stringify(streak))
  return streak
}

export function StreakCounter() {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: '', best: 0 })

  useEffect(() => {
    setStreak(computeStreak())
    const id = setInterval(() => setStreak(computeStreak()), 10000)
    return () => clearInterval(id)
  }, [])

  if (streak.count <= 0) return null

  return (
    <div className="flex items-center gap-1 rounded-full border border-orange-300/50 bg-orange-100/50 px-2.5 py-1 dark:border-orange-500/30 dark:bg-orange-950/50" title={`Best: ${streak.best} days`}>
      <span className="text-sm" aria-hidden="true">🔥</span>
      <span className="font-mono text-xs font-semibold tabular-nums text-orange-700 dark:text-orange-300">
        {streak.count}
      </span>
    </div>
  )
}
