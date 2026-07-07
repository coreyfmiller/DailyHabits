'use client'

import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'calendar-events'

export type CalendarEvent = {
  id: number
  date: string // YYYY-MM-DD
  text: string
}

function getStoredEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {}
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  // Sync state to localStorage
  useEffect(() => {
    setStoredEvents(events)
  }, [events])

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
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
              className={`relative flex size-10 items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-medium'
                  : isToday
                    ? 'ring-2 ring-primary/40 text-foreground'
                    : 'hover:bg-secondary/60 text-foreground'
              }`}
              aria-label={`${monthLabel} ${day}${hasEvents ? ' (has events)' : ''}`}
            >
              {day}
              {hasEvents && !isSelected && (
                <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <p className="text-sm font-medium text-foreground">{selectedLabel}</p>

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
              placeholder="Add event — e.g. Daughter's day, dentist appt"
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
      {!selectedDate && events.filter((e) => e.date === todayKey).length > 0 && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <p className="text-xs font-medium text-foreground">Today</p>
          <ul className="mt-1.5 grid gap-1">
            {events.filter((e) => e.date === todayKey).map((event) => (
              <li key={event.id} className="text-xs text-muted-foreground">• {event.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
