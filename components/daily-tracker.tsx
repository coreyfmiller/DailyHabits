'use client'

import {
  Briefcase,
  Calendar,
  Droplets,
  Dumbbell,
  Film,
  Footprints,
  Heart,
  LayoutGrid,
  Laptop,
  OctagonAlert,
  Settings,
  Sunrise,
  Users,
  Utensils,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { Button } from '@/components/ui/button'
import { CalendarView, isMadelynDay } from './tracker/calendar-view'
import { CalorieCounter } from './tracker/calorie-counter'
import { DailyProgress } from './tracker/daily-progress'
import { EveningWalk } from './tracker/evening-walk'
import { FamilyTime } from './tracker/family-time'
import { FitnessSection } from './tracker/fitness-section'
import { MealTabs } from './tracker/meal-tabs'
import { MorningRoutine } from './tracker/morning-routine'
import { DataManager } from './tracker/data-manager'
import { NotificationSettings } from './tracker/notifications'
import { RecurringTasksManager } from './tracker/recurring-tasks'
import { StreakCounter } from './tracker/streak-counter'
import { ThemeToggle } from './tracker/theme-toggle'
import { TimelineRow } from './tracker/timeline-row'
import { WeeklyView } from './tracker/weekly-view'
import { WorkBlock } from './tracker/work-block'
import { formatTimeOfDay, useNow } from './tracker/use-now'
import { WaterTracker } from './tracker/water-tracker'
import { SupplementManager, SupplementChecklist } from './tracker/supplement-tracker'

/** Determine which time block is active based on current minutes */
function getActiveBlock(minutesNow: number, isWeekend: boolean) {
  if (isWeekend) {
    if (minutesNow < 6 * 60 + 30) return 'pre'
    if (minutesNow < 10 * 60 + 30) return 'weekend-work'
    if (minutesNow < 12 * 60) return 'lunch'
    if (minutesNow < 20 * 60) return 'family'
    return 'evening'
  }
  if (minutesNow < 6 * 60 + 30) return 'pre'
  if (minutesNow < 8 * 60 + 30) return 'morning-routine'
  if (minutesNow < 12 * 60) return 'morning-work'
  if (minutesNow < 13 * 60) return 'fitness'
  if (minutesNow < 17 * 60) return 'afternoon-work'
  if (minutesNow < 18 * 60) return 'supper'
  if (minutesNow < 20 * 60) return 'family'
  if (minutesNow < 21 * 60) return 'evening-work'
  return 'done'
}

export function DailyTracker() {
  const now = useNow(1000)
  const [view, setView] = useState<'timeline' | 'calendar' | 'weekly' | 'settings'>('timeline')

  const [shower, setShower] = useLocalStorage('shower', false)
  const [coffee, setCoffee] = useLocalStorage('coffee', false)
  const [walkedWithFamily, setWalkedWithFamily] = useLocalStorage('walked-with-family', false)

  const today = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const dayOfWeek = now.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const hasMadelyn = isMadelynDay()
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const activeBlock = getActiveBlock(minutesNow, isWeekend)

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
            <h1 className="text-lg font-semibold tracking-tight text-foreground text-left">Daily Rhythm</h1>
            <p className="text-xs text-muted-foreground text-left">
              {today} · {formatTimeOfDay(now)}
              {isWeekend && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-primary">Weekend</span>}
              {hasMadelyn && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-pink-700 dark:bg-pink-950 dark:text-pink-300"><Heart className="size-3 fill-pink-500" />Madelyn</span>}
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
        <>
          <RecurringTasksManager />
          <SupplementManager />
          <DataManager />
          <NotificationSettings />
        </>
      ) : isWeekend && hasMadelyn ? (
        <WeekendMadelynTimeline coffee={coffee} onToggleCoffee={setCoffee} walkedWithFamily={walkedWithFamily} onToggleWalk={setWalkedWithFamily} />
      ) : isWeekend ? (
        <WeekendTimeline coffee={coffee} onToggleCoffee={setCoffee} walkedWithFamily={walkedWithFamily} onToggleWalk={setWalkedWithFamily} />
      ) : hasMadelyn ? (
        <WeekdayMadelynTimeline coffee={coffee} onToggleCoffee={setCoffee} walkedWithFamily={walkedWithFamily} onToggleWalk={setWalkedWithFamily} />
      ) : (
        <WeekdayTimeline coffee={coffee} onToggleCoffee={setCoffee} shower={shower} onToggleShower={setShower} walkedWithFamily={walkedWithFamily} onToggleWalk={setWalkedWithFamily} />
      )}
    </main>
  )
}

function WeekdayTimeline({ coffee, onToggleCoffee, shower, onToggleShower, walkedWithFamily, onToggleWalk }: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
  shower: boolean
  onToggleShower: (v: boolean) => void
  walkedWithFamily: boolean
  onToggleWalk: (v: boolean) => void
}) {
  const now = useNow(60_000)
  const min = now.getHours() * 60 + now.getMinutes()

  const s = (block: string): 'past' | 'active' | 'future' => {
    const ranges: Record<string, [number, number]> = {
      'morning-routine': [6 * 60 + 30, 8 * 60 + 30],
      'meals': [0, 24 * 60], // always available
      'morning-work': [8 * 60 + 30, 12 * 60],
      'fitness': [12 * 60, 13 * 60],
      'afternoon-work': [13 * 60, 17 * 60],
      'hard-stop': [18 * 60, 18 * 60 + 1],
      'family': [18 * 60, 20 * 60],
      'walk': [18 * 60, 21 * 60],
      'evening-work': [20 * 60, 21 * 60],
    }
    const [start, end] = ranges[block] ?? [0, 0]
    if (min >= end) return 'past'
    if (min >= start) return 'active'
    return 'future'
  }

  return (
    <section aria-label="Weekday timeline">
      <TimelineRow
        icon={Sunrise}
        time="6:30 AM – 8:30 AM"
        title="Morning Routine"
        subtitle="Ease into the day and set your focus."
        accent="primary"
        status={s('morning-routine')}
      >
        <MorningRoutine coffee={coffee} onToggleCoffee={onToggleCoffee} />
      </TimelineRow>

      <TimelineRow
        icon={Utensils}
        time="10:00 AM – 6:00 PM"
        title="Meals"
        subtitle="Eating window. Log breakfast, lunch, and supper."
        accent="primary"
        status={min >= 18 * 60 ? 'past' : min >= 10 * 60 ? 'active' : 'future'}
      >
        <MealTabs />
      </TimelineRow>

      <TimelineRow
        icon={Droplets}
        time="All Day"
        title="Water"
        subtitle="Stay hydrated — 8 glasses."
        accent="primary"
        status={min >= 21 * 60 ? 'past' : min >= 6 * 60 + 30 ? 'active' : 'future'}
      >
        <WaterTracker />
      </TimelineRow>

      <TimelineRow
        icon={Laptop}
        time="8:30 AM – 12:00 PM"
        title="Morning Work Block"
        subtitle="Personal business — build your own thing."
        accent="primary"
        status={s('morning-work')}
      >
        <WorkBlock id="morning" startMin={8 * 60 + 30} endMin={12 * 60} />
      </TimelineRow>

      <TimelineRow
        icon={Dumbbell}
        time="12:00 PM – 1:00 PM"
        title="Fitness"
        subtitle="20-min dumbbell routine and recovery."
        accent="primary"
        status={s('fitness')}
      >
        <FitnessSection shower={shower} onToggleShower={onToggleShower} />
      </TimelineRow>

      <SupplementChecklist time="midday" />

      <TimelineRow
        icon={Briefcase}
        time="1:00 PM – 5:00 PM"
        title="Afternoon Work Block"
        subtitle="Day job — finish strong."
        accent="primary"
        status={s('afternoon-work')}
      >
        <WorkBlock id="afternoon" startMin={13 * 60} endMin={17 * 60} />
      </TimelineRow>

      {/* 6 PM HARD STOP */}
      <TimelineRow
        icon={OctagonAlert}
        time="6:00 PM"
        title="Hard Stop"
        accent="destructive"
        status={s('hard-stop')}
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Work stops. Eating window closes.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No more meals or work after this point — family time starts now.
            </p>
          </div>
        </div>
      </TimelineRow>

      <TimelineRow
        icon={Users}
        time="6:00 PM – 8:00 PM"
        title="Family Time"
        subtitle="Be present. Log what you did together."
        accent="primary"
        status={s('family')}
      >
        <FamilyTime walkedWithFamily={walkedWithFamily} onToggleWalk={onToggleWalk} />
      </TimelineRow>

      <SupplementChecklist time="evening" />

      <TimelineRow
        icon={Footprints}
        time="Evening"
        title="Daily Walk"
        subtitle="30–60 min. With family or solo."
        accent="primary"
        status={s('walk')}
      >
        <EveningWalk walkedWithFamily={walkedWithFamily} />
      </TimelineRow>

      <TimelineRow
        icon={Laptop}
        time="8:00 PM – 9:00 PM"
        title="Evening Work Block"
        subtitle="Personal business — one focused hour."
        accent="primary"
        status={s('evening-work')}
        isLast
      >
        <WorkBlock id="evening" startMin={20 * 60} endMin={21 * 60} />
      </TimelineRow>
    </section>
  )
}

function WeekendTimeline({ coffee, onToggleCoffee, walkedWithFamily, onToggleWalk }: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
  walkedWithFamily: boolean
  onToggleWalk: (v: boolean) => void
}) {
  const now = useNow(60_000)
  const min = now.getHours() * 60 + now.getMinutes()

  const s = (start: number, end: number): 'past' | 'active' | 'future' => {
    if (min >= end) return 'past'
    if (min >= start) return 'active'
    return 'future'
  }

  return (
    <section aria-label="Weekend timeline">
      <TimelineRow
        icon={Sunrise}
        time="6:30 AM"
        title="Morning Routine"
        subtitle="Easy start — coffee and set intentions."
        accent="primary"
        status={s(6 * 60 + 30, 7 * 60)}
      >
        <MorningRoutine coffee={coffee} onToggleCoffee={onToggleCoffee} />
      </TimelineRow>

      <TimelineRow
        icon={Utensils}
        time="10:00 AM – 6:00 PM"
        title="Meals"
        subtitle="Eating window. Log breakfast, lunch, and supper."
        accent="primary"
        status={s(10 * 60, 18 * 60)}
      >
        <MealTabs />
      </TimelineRow>

      <TimelineRow
        icon={Droplets}
        time="All Day"
        title="Water"
        subtitle="Stay hydrated — 8 glasses."
        accent="primary"
        status={min >= 21 * 60 ? 'past' : min >= 6 * 60 + 30 ? 'active' : 'future'}
      >
        <WaterTracker />
      </TimelineRow>

      <TimelineRow
        icon={Laptop}
        time="6:30 AM – 10:30 AM"
        title="Personal Work Block"
        subtitle="4 hours of deep work on your business."
        accent="primary"
        status={s(6 * 60 + 30, 10 * 60 + 30)}
      >
        <WorkBlock id="weekend-morning" startMin={6 * 60 + 30} endMin={10 * 60 + 30} />
      </TimelineRow>

      <TimelineRow
        icon={Users}
        time="12:00 PM – 8:00 PM"
        title="Family Time"
        subtitle="Full afternoon with the family."
        accent="primary"
        status={s(12 * 60, 20 * 60)}
      >
        <FamilyTime walkedWithFamily={walkedWithFamily} onToggleWalk={onToggleWalk} />
      </TimelineRow>

      <TimelineRow
        icon={OctagonAlert}
        time="6:00 PM"
        title="Eating Window Closes"
        accent="destructive"
        status={s(18 * 60, 18 * 60 + 1)}
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Eating window closes.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No more food — fasting until 10 AM tomorrow.
            </p>
          </div>
        </div>
      </TimelineRow>

      <TimelineRow
        icon={Footprints}
        time="Evening"
        title="Daily Walk"
        subtitle="30–60 min. With family or solo."
        accent="primary"
        status={s(18 * 60, 20 * 60)}
      >
        <EveningWalk walkedWithFamily={walkedWithFamily} />
      </TimelineRow>

      <TimelineRow
        icon={Film}
        time="8:00 PM – 10:00 PM"
        title="Movie Night"
        subtitle="Wind down together."
        accent="primary"
        status={s(20 * 60, 22 * 60)}
        isLast
      >
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
          <Film className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Relax, watch something good, and enjoy the evening.
          </p>
        </div>
      </TimelineRow>
    </section>
  )
}

function WeekdayMadelynTimeline({ coffee, onToggleCoffee, walkedWithFamily, onToggleWalk }: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
  walkedWithFamily: boolean
  onToggleWalk: (v: boolean) => void
}) {
  const now = useNow(60_000)
  const min = now.getHours() * 60 + now.getMinutes()

  const s = (start: number, end: number): 'past' | 'active' | 'future' => {
    if (min >= end) return 'past'
    if (min >= start) return 'active'
    return 'future'
  }

  return (
    <section aria-label="Weekday with Madelyn">
      <TimelineRow
        icon={Sunrise}
        time="6:30 AM – 8:30 AM"
        title="Morning Routine"
        subtitle="Ease into the day with Madelyn."
        accent="primary"
        status={s(6 * 60 + 30, 8 * 60 + 30)}
      >
        <MorningRoutine coffee={coffee} onToggleCoffee={onToggleCoffee} />
      </TimelineRow>

      <TimelineRow
        icon={Utensils}
        time="10:00 AM – 6:00 PM"
        title="Meals"
        subtitle="Eating window. Log meals together."
        accent="primary"
        status={s(10 * 60, 18 * 60)}
      >
        <MealTabs />
      </TimelineRow>

      <TimelineRow
        icon={Droplets}
        time="All Day"
        title="Water"
        subtitle="Stay hydrated — 8 glasses."
        accent="primary"
        status={min >= 21 * 60 ? 'past' : min >= 6 * 60 + 30 ? 'active' : 'future'}
      >
        <WaterTracker />
      </TimelineRow>

      <TimelineRow
        icon={Briefcase}
        time="8:30 AM – 5:00 PM"
        title="Work"
        subtitle="Day job while she's at school/activities."
        accent="primary"
        status={s(8 * 60 + 30, 17 * 60)}
      >
        <WorkBlock id="afternoon" startMin={8 * 60 + 30} endMin={17 * 60} />
      </TimelineRow>

      <TimelineRow
        icon={OctagonAlert}
        time="6:00 PM"
        title="Eating Window Closes"
        accent="destructive"
        status={s(18 * 60, 18 * 60 + 1)}
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Eating window closes.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No more food — fasting until 10 AM tomorrow.
            </p>
          </div>
        </div>
      </TimelineRow>

      <TimelineRow
        icon={Users}
        time="5:00 PM – 8:00 PM"
        title="Madelyn Time"
        subtitle="All in — be present with her."
        accent="primary"
        status={s(17 * 60, 20 * 60)}
      >
        <FamilyTime walkedWithFamily={walkedWithFamily} onToggleWalk={onToggleWalk} />
      </TimelineRow>

      <TimelineRow
        icon={Footprints}
        time="Evening"
        title="Walk with Madelyn"
        subtitle="Get outside together."
        accent="primary"
        status={s(17 * 60, 21 * 60)}
      >
        <EveningWalk walkedWithFamily={walkedWithFamily} />
      </TimelineRow>

      <TimelineRow
        icon={Film}
        time="8:00 PM – 9:00 PM"
        title="Wind Down"
        subtitle="Movie, show, or reading together."
        accent="primary"
        status={s(20 * 60, 21 * 60)}
        isLast
      >
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
          <Heart className="mt-0.5 size-5 shrink-0 text-pink-500" />
          <p className="text-sm text-muted-foreground">
            Quality time before bed. No work tonight.
          </p>
        </div>
      </TimelineRow>
    </section>
  )
}

function WeekendMadelynTimeline({ coffee, onToggleCoffee, walkedWithFamily, onToggleWalk }: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
  walkedWithFamily: boolean
  onToggleWalk: (v: boolean) => void
}) {
  const now = useNow(60_000)
  const min = now.getHours() * 60 + now.getMinutes()

  const s = (start: number, end: number): 'past' | 'active' | 'future' => {
    if (min >= end) return 'past'
    if (min >= start) return 'active'
    return 'future'
  }

  return (
    <section aria-label="Weekend with Madelyn">
      <TimelineRow
        icon={Sunrise}
        time="6:30 AM"
        title="Morning Routine"
        subtitle="Easy start before she wakes up."
        accent="primary"
        status={s(6 * 60 + 30, 7 * 60 + 30)}
      >
        <MorningRoutine coffee={coffee} onToggleCoffee={onToggleCoffee} />
      </TimelineRow>

      <TimelineRow
        icon={Utensils}
        time="10:00 AM – 6:00 PM"
        title="Meals"
        subtitle="Eating window. Make meals together."
        accent="primary"
        status={s(10 * 60, 18 * 60)}
      >
        <MealTabs />
      </TimelineRow>

      <TimelineRow
        icon={Droplets}
        time="All Day"
        title="Water"
        subtitle="Stay hydrated — 8 glasses."
        accent="primary"
        status={min >= 21 * 60 ? 'past' : min >= 6 * 60 + 30 ? 'active' : 'future'}
      >
        <WaterTracker />
      </TimelineRow>

      <TimelineRow
        icon={Users}
        time="All Day"
        title="Madelyn Day"
        subtitle="She's the priority. Be fully present."
        accent="primary"
        status={s(7 * 60 + 30, 20 * 60)}
      >
        <FamilyTime walkedWithFamily={walkedWithFamily} onToggleWalk={onToggleWalk} />
      </TimelineRow>

      <TimelineRow
        icon={OctagonAlert}
        time="6:00 PM"
        title="Eating Window Closes"
        accent="destructive"
        status={s(18 * 60, 18 * 60 + 1)}
      >
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Eating window closes.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No more food — fasting until 10 AM tomorrow.
            </p>
          </div>
        </div>
      </TimelineRow>

      <TimelineRow
        icon={Footprints}
        time="Evening"
        title="Walk"
        subtitle="Get outside with Madelyn."
        accent="primary"
        status={s(18 * 60, 21 * 60)}
      >
        <EveningWalk walkedWithFamily={walkedWithFamily} />
      </TimelineRow>

      <TimelineRow
        icon={Film}
        time="8:00 PM – 10:00 PM"
        title="Movie Night"
        subtitle="Cozy up and watch something together."
        accent="primary"
        status={s(20 * 60, 22 * 60)}
        isLast
      >
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
          <Heart className="mt-0.5 size-5 shrink-0 text-pink-500" />
          <p className="text-sm text-muted-foreground">
            Her pick. Popcorn optional.
          </p>
        </div>
      </TimelineRow>
    </section>
  )
}
