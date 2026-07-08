'use client'

import { Briefcase, Check, Coffee, Dumbbell, Footprints, Laptop, ShowerHead, Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTagsForDate, type CalendarTag } from './calendar-tags'

const TAG_DOT_CLASSES: Record<string, string> = {
  pink: 'bg-pink-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
}

const TAG_PILL_CLASSES: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

type MealEntry = {
  id: number
  at: string
  title: string
  estimatedCalories: number | null
}

type DayData = {
  date: string
  label: string
  dayName: string
  isToday: boolean
  isWeekend: boolean
  tags: CalendarTag[]
  isPast: boolean
  coffee: boolean
  shower: boolean
  breakfast: MealEntry[]
  lunch: MealEntry[]
  supper: MealEntry[]
  workout: boolean
  workoutCount: string
  walk: boolean
  walkType: string
  morningWorkNotes: string
  afternoonWorkNotes: string
  eveningWorkNotes: string
  accomplishments: string[]
  todos: { text: string; done: boolean }[]
  familyActivities: { text: string; done: boolean }[]
  calories: number
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getDayData(date: Date, todayStr: string): DayData {
  const dateStr = formatDateKey(date)
  const prefix = `daily-habits:${dateStr}`
  const dow = date.getDay()
  const isPast = dateStr < todayStr

  const get = (key: string) => {
    try {
      const raw = localStorage.getItem(`${prefix}:${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const coffee = get('coffee') === true
  const shower = get('shower') === true
  const breakfastEntries: MealEntry[] = get('meals-breakfast') ?? []
  const lunchEntries: MealEntry[] = get('meals-lunch') ?? []
  const supperEntries: MealEntry[] = get('meals-supper') ?? []

  const routine: { name: string; done: boolean }[] = get('dumbbell-routine') ?? []
  const doneCount = routine.filter((e) => e.done).length
  const workout = doneCount > 0
  const workoutCount = `${doneCount}/${routine.length}`

  const walkedFamily = get('walked-with-family') === true
  const soloWalk = get('solo-walk') === true
  const walk = walkedFamily || soloWalk
  const walkType = walkedFamily ? 'Family' : soloWalk ? 'Solo' : ''

  const morningWorkNotes: string = get('work-notes-morning') ?? get('work-notes-weekend-morning') ?? ''
  const afternoonWorkNotes: string = get('work-notes-afternoon') ?? ''
  const eveningWorkNotes: string = get('work-notes-evening') ?? ''

  const accomplishments: string[] = get('accomplishments') ?? []
  const todos: { text: string; done: boolean }[] = get('todos') ?? []
  const familyActivities: { text: string; done: boolean }[] = get('family-activities') ?? []

  const calories = [...breakfastEntries, ...lunchEntries, ...supperEntries].reduce(
    (sum, e) => sum + (e.estimatedCalories ?? 0), 0
  )

  return {
    date: dateStr,
    label: String(date.getDate()),
    dayName: date.toLocaleDateString([], { weekday: 'short' }),
    isToday: dateStr === todayStr,
    isWeekend: dow === 0 || dow === 6,
    tags: getTagsForDate(dateStr),
    isPast,
    coffee,
    shower,
    breakfast: breakfastEntries,
    lunch: lunchEntries,
    supper: supperEntries,
    workout,
    workoutCount,
    walk,
    walkType,
    morningWorkNotes,
    afternoonWorkNotes,
    eveningWorkNotes,
    accomplishments,
    todos,
    familyActivities,
    calories,
  }
}

function getWeekDays(): Date[] {
  const now = new Date()
  const dow = now.getDay()
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

function habitsDone(day: DayData): number {
  let count = 0
  if (day.coffee) count++
  if (day.shower) count++
  if (day.breakfast.length > 0) count++
  if (day.lunch.length > 0) count++
  if (day.supper.length > 0) count++
  if (day.workout) count++
  if (day.walk) count++
  return count
}

const TOTAL_HABITS = 7

export function WeeklyView() {
  const [days, setDays] = useState<DayData[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    const todayStr = formatDateKey(new Date())
    const weekDates = getWeekDays()
    setDays(weekDates.map((d) => getDayData(d, todayStr)))
  }, [])

  const habits = [
    { key: 'coffee' as const, icon: Coffee, label: 'Coffee', check: (d: DayData) => d.coffee },
    { key: 'shower' as const, icon: ShowerHead, label: 'Shower', check: (d: DayData) => d.shower },
    { key: 'breakfast' as const, icon: Utensils, label: 'Breakfast', check: (d: DayData) => d.breakfast.length > 0 },
    { key: 'lunch' as const, icon: Utensils, label: 'Lunch', check: (d: DayData) => d.lunch.length > 0 },
    { key: 'supper' as const, icon: Utensils, label: 'Supper', check: (d: DayData) => d.supper.length > 0 },
    { key: 'workout' as const, icon: Dumbbell, label: 'Workout', check: (d: DayData) => d.workout },
    { key: 'walk' as const, icon: Footprints, label: 'Walk', check: (d: DayData) => d.walk },
  ]

  if (days.length === 0) return null

  const selected = selectedDay ? days.find((d) => d.date === selectedDay) : null

  return (
    <div className="grid gap-4">
      {/* Habit grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="w-24 py-2 text-left text-xs font-medium text-muted-foreground" />
              {days.map((day) => (
                <th
                  key={day.date}
                  className={`px-1 py-2 cursor-pointer ${day.isToday ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'} ${selectedDay === day.date ? 'bg-primary/10 rounded-t-lg' : ''}`}
                  onClick={() => setSelectedDay(day.date === selectedDay ? null : day.date)}
                >
                  <div className="text-xs">{day.dayName}</div>
                  <div className={`mt-0.5 text-sm ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day.label}
                  </div>
                  {day.tags.length > 0 && (
                    <div className="mx-auto mt-0.5 flex gap-0.5 justify-center">
                      {day.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className={`size-2 rounded-full ${TAG_DOT_CLASSES[tag.color] ?? TAG_DOT_CLASSES.pink}`}
                        />
                      ))}
                    </div>
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
                  <td key={day.date} className={`px-1 py-2.5 ${selectedDay === day.date ? 'bg-primary/5' : ''}`}>
                    {habit.check(day) ? (
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/15">
                        <Check className="size-3.5 text-primary" />
                      </span>
                    ) : day.isToday || day.isPast ? (
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
            {/* Calories row */}
            <tr className="border-t border-border/40">
              <td className="py-2.5 pr-2 text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  🔥 Calories
                </div>
              </td>
              {days.map((day) => (
                <td key={day.date} className={`px-1 py-2.5 ${selectedDay === day.date ? 'bg-primary/5' : ''}`}>
                  <span className="font-mono text-xs text-muted-foreground">
                    {day.calories > 0 ? day.calories : '—'}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Completion bars */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = habitsDone(day)
          const pct = Math.round((count / TOTAL_HABITS) * 100)
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDay(day.date === selectedDay ? null : day.date)}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                selectedDay === day.date
                  ? 'bg-primary/15 border border-primary/40'
                  : day.isToday
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-secondary/40 hover:bg-secondary/60'
              }`}
            >
              <span className={`font-mono text-xs font-medium ${day.isToday || selectedDay === day.date ? 'text-primary' : 'text-foreground'}`}>
                {count}/{TOTAL_HABITS}
              </span>
              <div className="h-1 w-full rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Day detail panel */}
      {selected && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {new Date(selected.date + 'T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              {selected.tags.length > 0 && selected.tags.map((tag) => (
                <span key={tag.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${TAG_PILL_CLASSES[tag.color] ?? TAG_PILL_CLASSES.pink}`}>
                  {tag.name}
                </span>
              ))}
              {selected.calories > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">
                  ~{selected.calories} kcal
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            {/* Accomplishments */}
            {selected.accomplishments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground">Accomplishments</p>
                <ul className="mt-1 grid gap-0.5">
                  {selected.accomplishments.map((a, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3 text-primary" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Todos / Pickup notes */}
            {selected.todos.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground">Pickup Notes</p>
                <ul className="mt-1 grid gap-0.5">
                  {selected.todos.map((t, i) => (
                    <li key={i} className={`flex items-center gap-1.5 text-xs ${t.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      <span className={`size-3 rounded-sm border ${t.done ? 'border-primary bg-primary' : 'border-border'}`}>
                        {t.done && <Check className="size-3 text-primary-foreground" />}
                      </span>
                      {t.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Work notes */}
            {(selected.morningWorkNotes || selected.afternoonWorkNotes || selected.eveningWorkNotes) && (
              <div>
                <p className="text-xs font-medium text-foreground">Work Notes</p>
                <div className="mt-1 grid gap-1">
                  {selected.morningWorkNotes && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Laptop className="mt-0.5 size-3 shrink-0" />
                      <span>{selected.morningWorkNotes}</span>
                    </div>
                  )}
                  {selected.afternoonWorkNotes && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="mt-0.5 size-3 shrink-0" />
                      <span>{selected.afternoonWorkNotes}</span>
                    </div>
                  )}
                  {selected.eveningWorkNotes && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Laptop className="mt-0.5 size-3 shrink-0" />
                      <span>{selected.eveningWorkNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meals detail */}
            {(selected.breakfast.length > 0 || selected.lunch.length > 0 || selected.supper.length > 0) && (
              <div>
                <p className="text-xs font-medium text-foreground">Meals</p>
                <div className="mt-1 grid gap-1">
                  {selected.breakfast.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>🌅 {m.title}</span>
                      {m.estimatedCalories && <span className="font-mono">{m.estimatedCalories} kcal</span>}
                    </div>
                  ))}
                  {selected.lunch.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>☀️ {m.title}</span>
                      {m.estimatedCalories && <span className="font-mono">{m.estimatedCalories} kcal</span>}
                    </div>
                  ))}
                  {selected.supper.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>🌙 {m.title}</span>
                      {m.estimatedCalories && <span className="font-mono">{m.estimatedCalories} kcal</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout detail */}
            {selected.workout && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Dumbbell className="size-3" />
                <span>Workout: {selected.workoutCount} exercises done</span>
              </div>
            )}

            {/* Walk */}
            {selected.walk && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Footprints className="size-3" />
                <span>{selected.walkType} walk completed</span>
              </div>
            )}

            {/* Family activities */}
            {selected.familyActivities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground">Family Time</p>
                <ul className="mt-1 grid gap-0.5">
                  {selected.familyActivities.map((a, i) => (
                    <li key={i} className={`flex items-center gap-1.5 text-xs ${a.done ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {a.done ? <Check className="size-3 text-primary" /> : <span className="size-3" />}
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state */}
            {!selected.coffee && !selected.shower && selected.breakfast.length === 0 && selected.lunch.length === 0 && selected.supper.length === 0 && !selected.workout && !selected.walk && selected.accomplishments.length === 0 && !selected.morningWorkNotes && !selected.afternoonWorkNotes && !selected.eveningWorkNotes && (
              <p className="text-xs text-muted-foreground italic">No data logged for this day.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
