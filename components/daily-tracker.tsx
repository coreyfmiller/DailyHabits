'use client'

import {
  Briefcase,
  Dumbbell,
  Flame,
  Footprints,
  OctagonAlert,
  Sunrise,
  Users,
  Utensils,
} from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { EveningWalk } from './tracker/evening-walk'
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
  const [walkedWithFamily, setWalkedWithFamily] = useLocalStorage('walked-with-family', false)

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
            coffee={coffee}
            onToggleCoffee={setCoffee}
          />
        </TimelineRow>

        <TimelineRow
          icon={Utensils}
          time="Breakfast"
          title="Breakfast"
          subtitle="First meal of the day."
          accent="primary"
        >
          <MealLog mealSlot="breakfast" />
        </TimelineRow>

        <TimelineRow
          icon={Briefcase}
          time="8:30 AM – 12:00 PM"
          title="Morning Work Block"
          subtitle="Deep, focused work before lunch."
          accent="primary"
        >
          <WorkBlock id="morning" startMin={8 * 60 + 30} endMin={12 * 60} />
        </TimelineRow>

        <TimelineRow
          icon={Utensils}
          time="Lunch"
          title="Lunch"
          subtitle="Midday fuel."
          accent="primary"
        >
          <MealLog mealSlot="lunch" />
        </TimelineRow>

        <TimelineRow
          icon={Dumbbell}
          time="12:00 PM – 1:00 PM"
          title="Fitness"
          subtitle="Weight training and recovery."
          accent="primary"
        >
          <FitnessSection shower={shower} onToggleShower={setShower} />
        </TimelineRow>

        <TimelineRow
          icon={Briefcase}
          time="1:00 PM – 5:00 PM"
          title="Afternoon Work Block"
          subtitle="Finish strong before the hard stop."
          accent="primary"
        >
          <WorkBlock id="afternoon" startMin={13 * 60} endMin={17 * 60} />
        </TimelineRow>

        <TimelineRow
          icon={Utensils}
          time="Supper"
          title="Supper"
          subtitle="Last meal before the fast begins."
          accent="primary"
        >
          <MealLog mealSlot="supper" />
        </TimelineRow>

        {/* 6 PM HARD STOP */}
        <TimelineRow
          icon={OctagonAlert}
          time="6:00 PM"
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
          time="6:00 PM – 8:00 PM"
          title="Family Time"
          subtitle="Be present. Log what you did together."
          accent="primary"
        >
          <FamilyTime walkedWithFamily={walkedWithFamily} onToggleWalk={setWalkedWithFamily} />
        </TimelineRow>

        <TimelineRow
          icon={Footprints}
          time="Evening"
          title="Daily Walk"
          subtitle="30–60 min. With family or solo."
          accent="primary"
        >
          <EveningWalk walkedWithFamily={walkedWithFamily} />
        </TimelineRow>

        <TimelineRow
          icon={Flame}
          time="Starts 6:00 PM"
          title="Fasting Timer"
          subtitle="Counting up since your last meal."
          accent="primary"
          isLast
        >
          <FastingTimer fast={fast} />
        </TimelineRow>
      </section>
    </main>
  )
}
