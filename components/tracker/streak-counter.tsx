'use client'

import { useEffect, useState } from 'react'

type StreakData = { count: number; lastDate: string }

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getHabitsCompleted(day: string): number {
  if (typeof window === 'undefined') return 0
  const prefix = `daily-habits:${day}`
  let count = 0

  // 1. Coffee
  try {
    const v = localStorage.getItem(`${prefix}:coffee`)
    if (v && JSON.parse(v) === true) count++
  } catch {}

  // 2. Shower
  try {
    const v = localStorage.getItem(`${prefix}:shower`)
    if (v && JSON.parse(v) === true) count++
  } catch {}

  // 3. Breakfast (meals-breakfast has entries)
  try {
    const v = localStorage.getItem(`${prefix}:meals-breakfast`)
    if (v) {
      const arr = JSON.parse(v)
      if (Array.isArray(arr) && arr.length > 0) count++
    }
  } catch {}

  // 4. Lunch
  try {
    const v = localStorage.getItem(`${prefix}:meals-lunch`)
    if (v) {
      const arr = JSON.parse(v)
      if (Array.isArray(arr) && arr.length > 0) count++
    }
  } catch {}

  // 5. Supper
  try {
    const v = localStorage.getItem(`${prefix}:meals-supper`)
    if (v) {
      const arr = JSON.parse(v)
      if (Array.isArray(arr) && arr.length > 0) count++
    }
  } catch {}

  // 6. Workout (dumbbell-routine has any done:true)
  try {
    const v = localStorage.getItem(`${prefix}:dumbbell-routine`)
    if (v) {
      const arr = JSON.parse(v)
      if (Array.isArray(arr) && arr.some((e: { done: boolean }) => e.done)) count++
    }
  } catch {}

  // 7. Walk (walked-with-family or solo-walk)
  try {
    const wf = localStorage.getItem(`${prefix}:walked-with-family`)
    const sw = localStorage.getItem(`${prefix}:solo-walk`)
    if ((wf && JSON.parse(wf) === true) || (sw && JSON.parse(sw) === true)) count++
  } catch {}

  return count
}

function computeStreak(): StreakData {
  const stored = localStorage.getItem('streak-data')
  let streak: StreakData = { count: 0, lastDate: '' }
  if (stored) {
    try {
      streak = JSON.parse(stored)
    } catch {}
  }

  const today = todayKey()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = dateKey(yesterday)

  // If we already computed for today, return as-is
  if (streak.lastDate === today) return streak

  // Check yesterday
  const yesterdayHabits = getHabitsCompleted(yesterdayStr)
  const todayHabits = getHabitsCompleted(today)

  if (streak.lastDate === yesterdayStr && yesterdayHabits >= 5) {
    // Continue streak — yesterday was good and we last updated yesterday
    streak.count = streak.count + (todayHabits >= 5 ? 1 : 0)
    streak.lastDate = today
  } else if (yesterdayHabits >= 5) {
    // We missed computing but yesterday was good — rebuild from yesterday
    // Count backwards to find streak length
    let count = 1
    const d = new Date()
    d.setDate(d.getDate() - 2)
    while (true) {
      const dk = dateKey(d)
      if (getHabitsCompleted(dk) >= 5) {
        count++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    streak.count = count + (todayHabits >= 5 ? 1 : 0)
    streak.lastDate = today
  } else {
    // Yesterday broke the streak
    streak.count = todayHabits >= 5 ? 1 : 0
    streak.lastDate = today
  }

  localStorage.setItem('streak-data', JSON.stringify(streak))
  return streak
}

export function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setStreak(computeStreak().count)
    const id = setInterval(() => setStreak(computeStreak().count), 5000)
    return () => clearInterval(id)
  }, [])

  if (streak <= 0) return null

  return (
    <div className="flex items-center gap-1 rounded-full border border-orange-300/50 bg-orange-100/50 px-2.5 py-1 dark:border-orange-500/30 dark:bg-orange-950/50">
      <span className="text-sm" aria-hidden="true">🔥</span>
      <span className="font-mono text-xs font-semibold tabular-nums text-orange-700 dark:text-orange-300">
        {streak}
      </span>
    </div>
  )
}
