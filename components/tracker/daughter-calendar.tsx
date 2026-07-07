'use client'

import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'daughter-days'

function getStoredDays(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredDays(days: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
  } catch {
    // storage full or unavailable
  }
}

/** Check if a given date string (YYYY-MM-DD) is a daughter day */
export function isDaughterDay(dateStr?: string): boolean {
  const key = dateStr ?? todayStr()
  const days = getStoredDays()
  return days.includes(key)
}

function todayStr() {
  const d = new Date()
  return formatDateKey(d)
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function DaughterCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDays, setSelectedDays] = useState<string[]>(getStoredDays)

  const toggleDay = useCallback((dateKey: string) => {
    setSelectedDays((prev) => {
      const next = prev.includes(dateKey)
        ? prev.filter((d) => d !== dateKey)
        : [...prev, dateKey]
      setStoredDays(next)
      return next
    })
  }, [])

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month - 1
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m }
    })
  }

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month + 1
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m }
    })
  }

  const { year, month } = currentMonth
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = firstDay.toLocaleDateString([], { month: 'long', year: 'numeric' })

  // Build grid cells
  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayKey = todayStr()

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Heart className="size-5 text-primary" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Daughter Days</h2>
          <p className="text-xs text-muted-foreground">Tap dates to mark when she's with you.</p>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">{monthLabel}</span>
        <Button size="sm" variant="ghost" onClick={nextMonth} aria-label="Next month">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDays.includes(dateKey)
          const isToday = dateKey === todayKey

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => toggleDay(dateKey)}
              className={`relative flex size-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-secondary/60 text-foreground'
              } ${isToday && !isSelected ? 'ring-2 ring-primary/40' : ''}`}
              aria-label={`${isSelected ? 'Remove' : 'Mark'} ${monthLabel} ${day}`}
            >
              {day}
              {isSelected && (
                <Heart className="absolute -top-0.5 -right-0.5 size-3 fill-primary text-primary-foreground" />
              )}
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {selectedDays.filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} days
          </span>{' '}
          marked this month
        </p>
        {selectedDays.includes(todayKey) && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-primary">
            <Heart className="size-3.5 fill-primary" />
            She's with you today
          </p>
        )}
      </div>
    </div>
  )
}
