'use client'

import { ChevronLeft, ChevronRight, Heart, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const EVENTS_KEY = 'calendar-events'
const MADELYN_KEY = 'madelyn-days'

export type CalendarEvent = {
  id: number
  date: string // YYYY-MM-DD
  text: string
}

function getStoredEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  } catch {}
}

function getStoredMadelynDays(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(MADELYN_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredMadelynDays(days: string[]) {
  try {
    localStorage.setItem(MADELYN_KEY, JSON.stringify(days))
  } catch {}
}

/** Check if a date is a Madelyn day */
export function isMadelynDay(dateStr?: string): boolean {
  const key = dateStr ?? todayStr()
  return getStoredMadelynDays().includes(key)
}

/** Get all events for a specific date (YYYY-MM-DD) */
export function getEventsForDate(dateStr: string): CalendarEvent[] {
  return getStoredEvents().filter((e) => e.date === dateStr)
}

/** Get today's date as YYYY-MM-DD */
export function todayStr() {
  const d = new Date()
  return formatDateKey(d)
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [events, setEvents] = useState<CalendarEvent[]>(getStoredEvents)
  const [madelynDays, setMadelynDays] = useState<string[]>(getStoredMadelynDays)
  const [madelynMode, setMadelynMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  useEffect(() => { setStoredEvents(events) }, [events])
  useEffect(() => { setStoredMadelynDays(madelynDays) }, [madelynDays])

  const toggleMadelynDay = useCallback((dateKey: string) => {
    setMadelynDays((prev) =>
      prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey]
    )
  }, [])

  const addEvent = useCallback(() => {
    const text = draft.trim()
    if (!text || !selectedDate) return
    setEvents((prev) => [...prev, { id: Date.now(), date: selectedDate, text }])
    setDraft('')
  }, [draft, selectedDate])

  const removeEvent = useCallback((id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
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

  const handleDayClick = (dateKey: string) => {
    if (madelynMode) {
      toggleMadelynDay(dateKey)
    } else {
      setSelectedDate(dateKey === selectedDate ? null : dateKey)
    }
  }

  const { year, month } = currentMonth
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = firstDay.toLocaleDateString([], { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayKey = todayStr()

  const selectedDateEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : []
  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="grid gap-4">
      {/* Madelyn mode toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2">
          <Heart className={`size-4 ${madelynMode ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'}`} />
          <div>
            <p className="text-sm font-medium text-foreground">Madelyn days</p>
            <p className="text-xs text-muted-foreground">
              {madelynMode ? 'Tap dates to toggle her days' : 'Click the heart to start marking days'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={madelynMode ? 'default' : 'secondary'}
          onClick={() => setMadelynMode(!madelynMode)}
          className={madelynMode ? 'bg-pink-500 hover:bg-pink-600' : ''}
        >
          <Heart className={`size-4 ${madelynMode ? 'fill-white' : ''}`} />
          {madelynMode ? 'Done' : 'Mark days'}
        </Button>
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
          const hasEvents = events.some((e) => e.date === dateKey)
          const isMadelyn = madelynDays.includes(dateKey)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate && !madelynMode

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayClick(dateKey)}
              className={`relative flex size-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-medium'
                  : isMadelyn
                    ? 'bg-pink-100 text-pink-700 font-medium dark:bg-pink-950 dark:text-pink-300'
                    : isToday
                      ? 'ring-2 ring-primary/40 text-foreground'
                      : 'hover:bg-secondary/60 text-foreground'
              } ${madelynMode ? 'cursor-pointer' : ''}`}
              aria-label={`${monthLabel} ${day}${isMadelyn ? ' (Madelyn day)' : ''}${hasEvents ? ' (has events)' : ''}`}
            >
              {day}
              {isMadelyn && (
                <Heart className="absolute -top-0.5 -right-0.5 size-3 fill-pink-500 text-pink-500" />
              )}
              {hasEvents && !isSelected && !isMadelyn && (
                <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date panel (only in normal mode) */}
      {!madelynMode && selectedDate && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <p className="text-sm font-medium text-foreground">
            {selectedLabel}
            {madelynDays.includes(selectedDate) && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                <Heart className="size-3 fill-pink-500" /> Madelyn
              </span>
            )}
          </p>

          {selectedDateEvents.length > 0 && (
            <ul className="mt-2 grid gap-1.5">
              {selectedDateEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm text-foreground"
                >
                  <span className="min-w-0 truncate">{event.text}</span>
                  <button
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${event.text}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addEvent()
              }}
              placeholder="Add event — e.g. dentist appt, date night"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <Button size="sm" onClick={addEvent} disabled={!draft.trim()}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Today's events summary */}
      {!madelynMode && !selectedDate && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          {madelynDays.includes(todayKey) && (
            <p className="flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400">
              <Heart className="size-3.5 fill-pink-500" />
              Madelyn is with you today
            </p>
          )}
          {events.filter((e) => e.date === todayKey).length > 0 && (
            <div className={madelynDays.includes(todayKey) ? 'mt-2' : ''}>
              <p className="text-xs font-medium text-foreground">Today&apos;s events</p>
              <ul className="mt-1.5 grid gap-1">
                {events.filter((e) => e.date === todayKey).map((event) => (
                  <li key={event.id} className="text-xs text-muted-foreground">• {event.text}</li>
                ))}
              </ul>
            </div>
          )}
          {!madelynDays.includes(todayKey) && events.filter((e) => e.date === todayKey).length === 0 && (
            <p className="text-xs text-muted-foreground">No events today. Tap a date to add events.</p>
          )}
        </div>
      )}
    </div>
  )
}
