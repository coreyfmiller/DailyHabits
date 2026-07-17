'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Droplets, Flame, Footprints,
  LineChart, Trophy, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

type DayData = {
  key: string
  meals: number
  calories: number
  water: number
  walked: boolean
  routineItems: number
}

function getDayData(day: string): DayData {
  if (typeof window === 'undefined') return { key: day, meals: 0, calories: 0, water: 0, walked: false, routineItems: 0 }
  const prefix = `daily-habits:${day}`
  let meals = 0, calories = 0, water = 0, walked = false, routineItems = 0

  try {
    const m = localStorage.getItem(`${prefix}:meals`)
    if (m) {
      const arr = JSON.parse(m)
      if (Array.isArray(arr)) {
        meals = arr.length
        calories = arr.reduce((s: number, e: { estimatedCalories?: number }) => s + (e.estimatedCalories ?? 0), 0)
      }
    }
  } catch {}

  try {
    const w = localStorage.getItem(`${prefix}:water-glasses`)
    if (w) water = JSON.parse(w) ?? 0
  } catch {}

  try {
    const wk = localStorage.getItem(`${prefix}:walk-done`)
    if (wk) walked = JSON.parse(wk) === true
  } catch {}

  try {
    const rc = localStorage.getItem(`${prefix}:routine-checked`)
    if (rc) { const arr = JSON.parse(rc); routineItems = Array.isArray(arr) ? arr.length : 0 }
  } catch {}

  return { key: day, meals, calories, water, walked, routineItems }
}

export default function InsightsPage() {
  const [thisWeek, setThisWeek] = useState<DayData[]>([])
  const [lastWeek, setLastWeek] = useState<DayData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const today = new Date()
    const dow = today.getDay()
    // Start of this week (Monday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - ((dow + 6) % 7))

    const tw: DayData[] = []
    const lw: DayData[] = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      if (d <= today) tw.push(getDayData(dateKey(d)))

      const ld = new Date(startOfWeek)
      ld.setDate(startOfWeek.getDate() + i - 7)
      lw.push(getDayData(dateKey(ld)))
    }

    setThisWeek(tw)
    setLastWeek(lw)
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Calculations
  const avgCalories = thisWeek.length > 0
    ? Math.round(thisWeek.reduce((s, d) => s + d.calories, 0) / thisWeek.length)
    : 0
  const lastAvgCalories = lastWeek.length > 0
    ? Math.round(lastWeek.reduce((s, d) => s + d.calories, 0) / lastWeek.length)
    : 0

  const avgWater = thisWeek.length > 0
    ? +(thisWeek.reduce((s, d) => s + d.water, 0) / thisWeek.length).toFixed(1)
    : 0
  const lastAvgWater = lastWeek.length > 0
    ? +(lastWeek.reduce((s, d) => s + d.water, 0) / lastWeek.length).toFixed(1)
    : 0

  const walkDays = thisWeek.filter((d) => d.walked).length
  const lastWalkDays = lastWeek.filter((d) => d.walked).length

  const routineDays = thisWeek.filter((d) => d.routineItems > 0).length
  const lastRoutineDays = lastWeek.filter((d) => d.routineItems > 0).length

  const activeDays = thisWeek.filter((d) => d.meals > 0 || d.water > 0 || d.walked || d.routineItems > 0).length

  return (
    <div className="min-h-dvh bg-background pb-8">
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/app" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Weekly Insights</h1>
          <div className="w-14" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Overview */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/15">
            <LineChart className="size-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">This Week</h2>
          <p className="text-sm text-muted-foreground">{activeDays}/7 days active</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <InsightCard
            icon={<Flame className="size-4 text-primary" />}
            label="Avg Calories"
            value={avgCalories > 0 ? `${avgCalories}` : '—'}
            unit="kcal/day"
            trend={avgCalories > lastAvgCalories ? 'up' : avgCalories < lastAvgCalories ? 'down' : 'flat'}
          />
          <InsightCard
            icon={<Droplets className="size-4 text-blue-500" />}
            label="Avg Water"
            value={avgWater > 0 ? `${avgWater}` : '—'}
            unit="glasses/day"
            trend={avgWater > lastAvgWater ? 'up' : avgWater < lastAvgWater ? 'down' : 'flat'}
          />
          <InsightCard
            icon={<Footprints className="size-4 text-green-500" />}
            label="Walks"
            value={`${walkDays}`}
            unit={`/${thisWeek.length} days`}
            trend={walkDays > lastWalkDays ? 'up' : walkDays < lastWalkDays ? 'down' : 'flat'}
          />
          <InsightCard
            icon={<Trophy className="size-4 text-amber-500" />}
            label="Routine"
            value={`${routineDays}`}
            unit={`/${thisWeek.length} days`}
            trend={routineDays > lastRoutineDays ? 'up' : routineDays < lastRoutineDays ? 'down' : 'flat'}
          />
        </div>

        {/* Daily breakdown */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Day by Day
          </h3>
          <div className="space-y-2">
            {thisWeek.map((day) => {
              const dayName = new Date(day.key + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })
              const score = (day.meals > 0 ? 1 : 0) + (day.water >= 4 ? 1 : 0) + (day.walked ? 1 : 0) + (day.routineItems > 0 ? 1 : 0)
              return (
                <div key={day.key} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted-foreground">{dayName}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(score / 4) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-mono text-muted-foreground">{score}/4</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tip */}
        {walkDays < 3 && thisWeek.length >= 5 && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm text-foreground font-medium">💡 Insight</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You walked {walkDays} out of {thisWeek.length} days this week. Try adding a 15-minute walk after dinner — it compounds.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({ icon, label, value, unit, trend }: {
  icon: React.ReactNode; label: string; value: string; unit: string; trend: 'up' | 'down' | 'flat'
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <TrendIcon className={cn('size-3.5', trendColor)} />
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[0.6rem] text-muted-foreground">{label} · {unit}</p>
    </div>
  )
}
