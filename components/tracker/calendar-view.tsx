'use client'

import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalendarTagSelector,
  getCalendarTags,
  getTagIdsForDate,
  toggleTagForDate,
  type CalendarTag,
} from './calendar-tags'

const EVENTS_KEY = 'calendar-events'

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
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [tagVersion, setTagVersion] = useState(0) // bump to re-render after tag toggles

  useEffect(() => { setStoredEvents(events) }, [events])

  const handleToggleTag = useCallback((dateKey: string) => {
    if (!activeTagId) return
    toggleTagForDate(dateKey, activeTagId)
    setTagVersion((v) => v + 1)
  }, [activeTagId])

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
    if (activeTagId) {
      handleToggleTag(dateKey)
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
  const allTags = getCalendarTags()

  const selectedDateEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : []
  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  // Get tags for selected date
  const selectedDateTagIds = selectedDate ? getTagIdsForDate(selectedDate) : []
  const selectedDateTags = allTags.filter((t) => selectedDateTagIds.includes(t.id))

  // Color helper
  const COLOR_CLASSES: Record<string, { dot: string; pill: string; pillDark: string }> = {
    pink: { dot: 'bg-pink-500', pill: 'bg-pink-100 text-pink-700', pillDark: 'dark:bg-pink-950 dark:text-pink-300' },
    blue: { dot: 'bg-blue-500', pill: 'bg-blue-100 text-blue-700', pillDark: 'dark:bg-blue-950 dark:text-blue-300' },
    green: { dot: 'bg-green-500', pill: 'bg-green-100 text-green-700', pillDark: 'dark:bg-green-950 dark:text-green-300' },
    orange: { dot: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700', pillDark: 'dark:bg-orange-950 dark:text-orange-300' },
    purple: { dot: 'bg-purple-500', pill: 'bg-purple-100 text-purple-700', pillDark: 'dark:bg-purple-950 dark:text-purple-300' },
    red: { dot: 'bg-red-500', pill: 'bg-red-100 text-red-700', pillDark: 'dark:bg-red-950 dark:text-red-300' },
  }

  return (
    <div className="grid gap-4">
      {/* Tag selector */}
      <CalendarTagSelector activeTagId={activeTagId} onSelectTag={setActiveTagId} />

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
          const dateTagIds = getTagIdsForDate(dateKey)
          const dateTags = allTags.filter((t) => dateTagIds.includes(t.id))
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate && !activeTagId

          // Force re-read on tagVersion change
          void tagVersion

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayClick(dateKey)}
              className={`relative flex flex-col items-center justify-center size-10 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-medium'
                  : isToday
                    ? 'ring-2 ring-primary/40 text-foreground'
                    : 'hover:bg-secondary/60 text-foreground'
              } ${activeTagId ? 'cursor-pointer' : ''}`}
              aria-label={`${monthLabel} ${day}${dateTags.length > 0 ? ` (${dateTags.map((t) => t.name).join(', ')})` : ''}${hasEvents ? ' (has events)' : ''}`}
            >
              <span>{day}</span>
              {/* Tag dots */}
              {dateTags.length > 0 && (
                <span className="absolute bottom-0.5 flex gap-0.5">
                  {dateTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className={`size-1.5 rounded-full ${(COLOR_CLASSES[tag.color] ?? COLOR_CLASSES.pink).dot}`}
                    />
                  ))}
                </span>
              )}
              {/* Event dot (only if no tags shown) */}
              {hasEvents && dateTags.length === 0 && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date panel (only when not in tag mode) */}
      {!activeTagId && selectedDate && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{selectedLabel}</p>
            {selectedDateTags.map((tag) => {
              const colors = COLOR_CLASSES[tag.color] ?? COLOR_CLASSES.pink
              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.pill} ${colors.pillDark}`}
                >
                  {tag.name}
                </span>
              )
            })}
          </div>

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

      {/* Today's summary (when no date selected and not in tag mode) */}
      {!activeTagId && !selectedDate && (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
          {(() => {
            const todayTags = allTags.filter((t) => getTagIdsForDate(todayKey).includes(t.id))
            const todayEvents = events.filter((e) => e.date === todayKey)
            if (todayTags.length === 0 && todayEvents.length === 0) {
              return <p className="text-xs text-muted-foreground">No events today. Tap a date to add events.</p>
            }
            return (
              <>
                {todayTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {todayTags.map((tag) => {
                      const colors = COLOR_CLASSES[tag.color] ?? COLOR_CLASSES.pink
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.pill} ${colors.pillDark}`}
                        >
                          {tag.name}
                        </span>
                      )
                    })}
                  </div>
                )}
                {todayEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground">Today&apos;s events</p>
                    <ul className="mt-1.5 grid gap-1">
                      {todayEvents.map((event) => (
                        <li key={event.id} className="text-xs text-muted-foreground">• {event.text}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
