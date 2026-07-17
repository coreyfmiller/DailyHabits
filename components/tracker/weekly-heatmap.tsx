'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getCompletionForDate(day: string): number {
  if (typeof window === 'undefined') return 0
  const prefix = `daily-habits:${day}`
  let done = 0
  let total = 0

  // Check common trackable items
  const boolKeys = ['coffee', 'shower', 'walk-done']
  for (const k of boolKeys) {
    total++
    try {
      const v = localStorage.getItem(`${prefix}:${k}`)
      if (v && JSON.parse(v) === true) done++
    } catch {}
  }

  // Meals
  total++
  try {
    const v = localStorage.getItem(`${prefix}:meals`)
    if (v) {
      const arr = JSON.parse(v)
      if (Array.isArray(arr) && arr.length > 0) done++
    }
  } catch {}

  // Water
  total++
  try {
    const v = localStorage.getItem(`${prefix}:water-glasses`)
    if (v && JSON.parse(v) >= 4) done++
  } catch {}

  if (total === 0) return 0
  return done / total
}

export function WeeklyHeatmap() {
  const [data, setData] = useState<{ key: string; label: string; percent: number }[]>([])

  useEffect(() => {
    const days: { key: string; label: string; percent: number }[] = []
    const today = new Date()

    // Get last 28 days (4 weeks)
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = dateKey(d)
      const label = d.toLocaleDateString([], { weekday: 'narrow' })
      days.push({ key, label, percent: getCompletionForDate(key) })
    }
    setData(days)
  }, [])

  if (data.length === 0) return null

  // Check if there's any data at all
  const hasAnyData = data.some((d) => d.percent > 0)
  if (!hasAnyData) return null

  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Last 4 weeks
        </h3>
        <span className="text-xs text-muted-foreground">
          {data.filter((d) => d.percent >= 0.6).length}/28 days active
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => (
          <span key={i} className="text-center text-[0.55rem] text-muted-foreground/60 pb-0.5">
            {label}
          </span>
        ))}
        {/* Cells — 4 weeks × 7 days */}
        {data.map((day) => (
          <div
            key={day.key}
            className={cn(
              'aspect-square rounded-sm transition-colors',
              day.percent === 0 && 'bg-secondary/60',
              day.percent > 0 && day.percent < 0.4 && 'bg-primary/20',
              day.percent >= 0.4 && day.percent < 0.7 && 'bg-primary/40',
              day.percent >= 0.7 && day.percent < 1 && 'bg-primary/70',
              day.percent >= 1 && 'bg-primary',
            )}
            title={`${day.key}: ${Math.round(day.percent * 100)}%`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="text-[0.55rem] text-muted-foreground">Less</span>
        <div className="size-2.5 rounded-sm bg-secondary/60" />
        <div className="size-2.5 rounded-sm bg-primary/20" />
        <div className="size-2.5 rounded-sm bg-primary/40" />
        <div className="size-2.5 rounded-sm bg-primary/70" />
        <div className="size-2.5 rounded-sm bg-primary" />
        <span className="text-[0.55rem] text-muted-foreground">More</span>
      </div>
    </div>
  )
}
