'use client'

import { CalendarCheck, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocalStorage } from '@/lib/use-local-storage'

type CalendarEvent = {
  id: number
  date: string
  text: string
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getTodayEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('calendar-events')
    if (!raw) return []
    const all: CalendarEvent[] = JSON.parse(raw)
    const today = todayStr()
    return all.filter((e) => e.date === today)
  } catch {
    return []
  }
}

export function TodayTasks() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [done, setDone] = useLocalStorage<number[]>('calendar-tasks-done', [])

  useEffect(() => {
    setEvents(getTodayEvents())
  }, [])

  if (events.length === 0) return null

  const toggle = (id: number) => {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const completedCount = events.filter((e) => done.includes(e.id)).length

  return (
    <div className="mb-6 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarCheck className="size-4 text-primary" />
          Today&apos;s Tasks
        </div>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">
          {completedCount}/{events.length}
        </span>
      </div>
      <ul className="grid gap-1.5">
        {events.map((event) => {
          const isDone = done.includes(event.id)
          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => toggle(event.id)}
                className="flex w-full items-center gap-3 rounded-md bg-secondary/40 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/60"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    isDone
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  <Check className={`size-3.5 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                </span>
                <span
                  className={`flex-1 ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                >
                  {event.text}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
