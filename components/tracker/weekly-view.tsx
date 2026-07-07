'use client'

import { Check, Coffee, Dumbbell, Footprints, Heart, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isMadelynDay } from './calendar-view'

type DayData = {
  date: string
  label: string
  dayName: string
  isToday: boolean
  isWeekend: boolean
  isMadelyn: boolean
  coffee: boolean
  breakfast: boolean
  lunch: boolean
  supper: boolean
  workout: boolean
  walk: boolean
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getDayData(date: Date, todayStr: string): DayData {
  const dateStr = formatDateKey(date)
  const prefix = `daily-habits:${dateStr}`
  const dow = date.getDay()

  const get = (key: string) => {
    try {
      const raw = localStorage.getItem(`${prefix}:${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const coffee = get('coffee') === true
  const breakfast = (get('meals-breakfast') ?? []).length > 0
  const lunch = (get('meals-lunch') ?? []).length > 0
  const supper = (get('meals-supper') ?? []).length > 0

  // Workout: check if any exercises were completed
  const routine = get('dumbbell-routine') ?? []
  const workout = routine.some((e: { done: boolean }) => e.done)

  // Walk
  const walkedFamily = get('walked-with-family') === true
  const soloWalk = get('solo-walk') === true
  const walk = walkedFamily || soloWalk

  return {
    date: dateStr,
    label: String(date.getDate()),
    dayName: date.toLocaleDateString([], { weekday: 'short' }),
    isToday: dateStr === todayStr,
    isWeekend: dow === 0 || dow === 6,
    isMadelyn: isMadelynDay(dateStr),
    coffee,
    breakfast,
    lunch,
    supper,
    workout,
    walk,
  }
}

function getWeekDays(): Date[] {
  const now = new Date()
  const dow = now.getDay() // 0 = Sunday
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - dow)
  sunday.setHours(0, 0, 0, 0)

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    days.push(d)
  }
  return days
}

function completionCount(day: DayData): number {
  let count = 0
  if (day.coffee) count++
  if (day.breakfast) count++
  if (day.lunch) count++
  if (day.supper) count++
  if (day.workout) count++
  if (day.walk) count++
  return count
}

export function WeeklyView() {
  const [days, setDays] = useState<DayData[]>([])

  useEffect(() => {
    const todayStr = formatDateKey(new Date())
    const weekDates = getWeekDays()
    setDays(weekDates.map((d) => getDayData(d, todayStr)))
  }, [])

  const habits = [
    { key: 'coffee' as const, icon: Coffee, label: 'Coffee' },
    { key: 'breakfast' as const, icon: Utensils, label: 'Breakfast' },
    { key: 'lunch' as const, icon: Utensils, label: 'Lunch' },
    { key: 'supper' as const, icon: Utensils, label: 'Supper' },
    { key: 'workout' as const, icon: Dumbbell, label: 'Workout' },
    { key: 'walk' as const, icon: Footprints, label: 'Walk' },
  ]

  if (days.length === 0) return null

  return (
    <div className="grid gap-4">
      {/* Week header with day columns */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="w-24 py-2 text-left text-xs font-medium text-muted-foreground" />
              {days.map((day) => (
                <th
                  key={day.date}
                  className={`px-1 py-2 ${day.isToday ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'}`}
                >
                  <div className="text-xs">{day.dayName}</div>
                  <div className={`mt-0.5 text-sm ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day.label}
                  </div>
                  {day.isMadelyn && (
                    <Heart className="mx-auto mt-0.5 size-3 fill-pink-500 text-pink-500" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.key} className="border-t border-border/40">
                <td className="py-2.5 pr-2 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <habit.icon className="size-3.5" />
                    {habit.label}
                  </div>
                </td>
                {days.map((day) => (
                  <td key={day.date} className="px-1 py-2.5">
                    {day[habit.key] ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/15">
                        <Check className="size-3.5 text-primary" />
                      </span>
                    ) : day.isToday || new Date(day.date) < new Date() ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-secondary/60">
                        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                      </span>
                    ) : (
                      <span className="inline-flex size-6 items-center justify-center">
                        <span className="size-1.5 rounded-full bg-border" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Completion summary */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = completionCount(day)
          const max = 6
          const pct = Math.round((count / max) * 100)
          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 ${day.isToday ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/40'}`}
            >
              <span className={`font-mono text-xs font-medium ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                {pct}%
              </span>
              <div className="h-1 w-full rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
