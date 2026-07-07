'use client'

import {
  Bot,
  Briefcase,
  Dumbbell,
  Flame,
  OctagonAlert,
  Sunrise,
  Users,
} from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { FamilyTime } from './tracker/family-time'
import { FastingPill, FastingTimer, useFast } from './tracker/fasting-timer'
import { FitnessSection } from './tracker/fitness-section'
import { MealLog } from './tracker/meal-log'
import { MorningRoutine } from './tracker/morning-routine'
import { TimelineRow } from './tracker/timeline-row'
import { WorkBlock } from './tracker/work-block'
import { formatTimeOfDay, useNow } from './tracker/use-now'

export function DailyTracker() {
  const now = useNow(1000)
  const fast = useFast()

  const [shower, setShower] = useLocalStorage('shower', false)
  const [coffee, setCoffee] = useLocalStorage('coffee', false)
  const [gymShower, setGymShower] = useLocalStorage('gym-shower', false)

  const today = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-16 sm:px-6">
      {/* Persistent header */}
      <header className="sticky top-0 z-20 -mx-4 mb-8 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Daily Rhythm</h1>
            <p className="text-xs text-muted-foreground">
              {today} · {formatTimeOfDay(now)}
            </p>
          </div>
          <FastingPill fast={fast} />
        </div>
      </header>

      {/* Timeline */}
      <section aria-label="Daily timeline">
        <TimelineRow
          icon={Sunrise}
          time="6:30 AM – 8:30 AM"
          title="Morning Routine"
          subtitle="Ease into the day and set your focus."
          accent="primary"
        >
          <MorningRoutine
            shower={shower}
            coffee={coffee}
            onToggleShower={setShower}
            onToggleCoffee={setCoffee}
          />
        </TimelineRow>

        <TimelineRow
          icon={Briefcase}
          time="8:30 AM – 5:00 PM"
          title="Professional Work"
          subtitle="Deep, focused work until the hard stop."
          accent="primary"
        >
          <WorkBlock />
        </TimelineRow>

        <TimelineRow
          icon={Dumbbell}
          time="Afternoon"
          title="Fitness"
          subtitle="Weight training and recovery."
          accent="primary"
        >
          <FitnessSection gymShower={gymShower} onToggleGymShower={setGymShower} />
        </TimelineRow>

        {/* 5 PM HARD STOP */}
        <TimelineRow
          icon={OctagonAlert}
          time="5:00 PM"
          title="Hard Stop"
          accent="destructive"
        >
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
            <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Work stops. Eating window closes.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No more meals or work after this point — the fast begins and family time starts now.
              </p>
            </div>
          </div>
        </TimelineRow>

        <TimelineRow
          icon={Users}
          time="5:00 PM – 7:00 PM"
          title="Family Time"
          subtitle="Be present. Log what you did together."
          accent="primary"
        >
          <FamilyTime />
        </TimelineRow>

        <TimelineRow
          icon={Flame}
          time="Starts 5:00 PM"
          title="Fasting Timer"
          subtitle="Counting up since your last meal."
          accent="primary"
        >
          <FastingTimer fast={fast} />
        </TimelineRow>

        <TimelineRow
          icon={Bot}
          time="Anytime"
          title="AI Meal Log"
          subtitle="Describe a meal and let AI track what & when."
          accent="primary"
          isLast
        >
          <MealLog />
        </TimelineRow>
      </section>
    </main>
  )
}
