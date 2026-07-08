'use client'

import {
  Calendar,
  LayoutGrid,
  Pencil,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getScheduleConfig } from '@/lib/schedule-config'
import { CalendarView } from './tracker/calendar-view'
import { CalendarTagsManager, getTagsForToday } from './tracker/calendar-tags'
import { CalorieCounter } from './tracker/calorie-counter'
import { DailyProgress } from './tracker/daily-progress'
import { DataManager } from './tracker/data-manager'
import { DynamicTimeline } from './tracker/dynamic-timeline'
import { NotificationSettings } from './tracker/notifications'
import { RecurringTasksManager } from './tracker/recurring-tasks'
import { StreakCounter } from './tracker/streak-counter'
import { SupplementManager } from './tracker/supplement-tracker'
import { ThemeToggle } from './tracker/theme-toggle'
import { WeeklyView } from './tracker/weekly-view'
import { WorkoutSetup } from './tracker/workout-setup'
import { formatTimeOfDay, useNow } from './tracker/use-now'

// Color classes for tag badges in the header
const TAG_PILL_CLASSES: Record<string, { pill: string; pillDark: string }> = {
  pink: { pill: 'bg-pink-100 text-pink-700', pillDark: 'dark:bg-pink-950 dark:text-pink-300' },
  blue: { pill: 'bg-blue-100 text-blue-700', pillDark: 'dark:bg-blue-950 dark:text-blue-300' },
  green: { pill: 'bg-green-100 text-green-700', pillDark: 'dark:bg-green-950 dark:text-green-300' },
  orange: { pill: 'bg-orange-100 text-orange-700', pillDark: 'dark:bg-orange-950 dark:text-orange-300' },
  purple: { pill: 'bg-purple-100 text-purple-700', pillDark: 'dark:bg-purple-950 dark:text-purple-300' },
  red: { pill: 'bg-red-100 text-red-700', pillDark: 'dark:bg-red-950 dark:text-red-300' },
}

export function DailyTracker() {
  const now = useNow(1000)
  const [view, setView] = useState<'timeline' | 'calendar' | 'weekly' | 'settings'>('timeline')

  const today = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const schedule = getScheduleConfig()
  const activeSchedule = isWeekend ? schedule.weekend : schedule.weekday

  // Get today's calendar tags for the header badge display
  const todayTags = getTagsForToday()

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-16 sm:px-6">
      {/* Persistent header */}
      <header className="sticky top-0 z-20 -mx-4 mb-8 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => view !== 'timeline' && setView('timeline')}
            className={view !== 'timeline' ? 'cursor-pointer' : 'cursor-default'}
          >
            <img src="/darktextlogo.png" alt="RoutinePro.ai" className="h-6 dark:hidden" />
            <img src="/lighttextlogo.png" alt="RoutinePro.ai" className="h-6 hidden dark:block" />
            <p className="text-xs text-muted-foreground text-left">
              {today} · {formatTimeOfDay(now)}
              {isWeekend && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-primary">Weekend</span>}
              {todayTags.map((tag) => {
                const colors = TAG_PILL_CLASSES[tag.color] ?? TAG_PILL_CLASSES.pink
                return (
                  <span key={tag.id} className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${colors.pill} ${colors.pillDark}`}>
                    {tag.name}
                  </span>
                )
              })}
            </p>
          </button>
          <div className="flex items-center gap-2">
            <DailyProgress />
            <StreakCounter />
            <CalorieCounter />
            <ThemeToggle />
            {view !== 'timeline' ? (
              <Button size="sm" variant="default" onClick={() => setView('timeline')}>
                <X className="size-4" />
                Close
              </Button>
            ) : (
              <>
                <Button size="sm" variant="secondary" onClick={() => setView('settings')}>
                  <Settings className="size-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setView('weekly')}>
                  <LayoutGrid className="size-4" />
                  Week
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setView('calendar')}>
                  <Calendar className="size-4" />
                  Calendar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {view === 'calendar' ? (
        <CalendarView />
      ) : view === 'weekly' ? (
        <WeeklyView />
      ) : view === 'settings' ? (
        <div className="grid gap-6">
          <a
            href="/app/setup"
            className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
          >
            <Pencil className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Edit Schedule</p>
              <p className="text-xs text-muted-foreground">Add, remove, or reorder blocks in your daily timeline.</p>
            </div>
          </a>
          <RecurringTasksManager />
          <CalendarTagsManager />
          <WorkoutSetup />
          <SupplementManager />
          <DataManager />
          <NotificationSettings />
        </div>
      ) : (
        <DynamicTimeline schedule={activeSchedule} />
      )}
    </main>
  )
}
