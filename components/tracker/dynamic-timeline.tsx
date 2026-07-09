'use client'

import {
  Activity,
  BedDouble,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Car,
  ChefHat,
  Coffee,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Footprints,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  MessageCircle,
  MonitorOff,
  Moon,
  OctagonAlert,
  Palette,
  Pill,
  ShoppingCart,
  Sparkles,
  SquarePlus,
  Sunrise,
  Target,
  Users,
  Utensils,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useLocalStorage } from '@/lib/use-local-storage'
import { getBlockType } from '@/lib/block-registry'
import type { ScheduleBlock } from '@/lib/schedule-config'

import { EveningWalk } from './evening-walk'
import { FamilyTime } from './family-time'
import { FitnessSection } from './fitness-section'
import { GenericBlock } from './generic-block'
import { MealTabs } from './meal-tabs'
import { MorningRoutine } from './morning-routine'
import { SupplementChecklist } from './supplement-tracker'
import { TimelineRow } from './timeline-row'
import { useNow } from './use-now'
import { WaterTracker } from './water-tracker'
import { WorkBlock } from './work-block'

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  BedDouble,
  BookMarked,
  BookOpen,
  Brain,
  Briefcase,
  Car,
  ChefHat,
  Coffee,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Footprints,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  MessageCircle,
  MonitorOff,
  Moon,
  OctagonAlert,
  Palette,
  Pill,
  ShoppingCart,
  Sparkles,
  SquarePlus,
  Sunrise,
  Target,
  Users,
  Utensils,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatTimeRange(startTime: string, endTime: string): string {
  const format = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return m === 0 ? `${h12}:00 ${suffix}` : `${h12}:${m.toString().padStart(2, '0')} ${suffix}`
  }
  if (startTime === endTime) return format(startTime)
  return `${format(startTime)} – ${format(endTime)}`
}

// ─── DynamicTimeline ─────────────────────────────────────────────────────────

export function DynamicTimeline({ schedule }: { schedule: ScheduleBlock[] }) {
  const now = useNow(60_000)
  const minutesNow = now.getHours() * 60 + now.getMinutes()

  const [shower, setShower] = useLocalStorage('shower', false)
  const [coffee, setCoffee] = useLocalStorage('coffee', false)

  return (
    <section aria-label="Daily timeline">
      {schedule.map((block, index) => {
        const blockType = getBlockType(block.blockTypeId)
        if (!blockType) return null

        const Icon = ICON_MAP[blockType.icon] ?? Sunrise
        const startMin = parseMinutes(block.startTime)
        const endMin = parseMinutes(block.endTime)
        const isLast = index === schedule.length - 1

        // Determine status
        // All-day tracker blocks (meals, water, supplements) are always active
        const alwaysActive = ['MealTabs', 'WaterTracker', 'Supplements'].includes(blockType.component)
        let status: 'past' | 'active' | 'future' = 'future'
        if (alwaysActive) {
          status = 'active'
        } else {
          const effectiveEnd = startMin === endMin ? endMin + 1 : endMin
          if (minutesNow >= effectiveEnd) status = 'past'
          else if (minutesNow >= startMin) status = 'active'
        }

        // Determine accent
        const accent = blockType.component === 'HardStop' ? 'destructive' : 'primary'

        const timeLabel = formatTimeRange(block.startTime, block.endTime)

        return (
          <TimelineRow
            key={block.instanceId}
            icon={Icon}
            time={timeLabel}
            title={block.label}
            subtitle={block.subtitle}
            accent={accent}
            status={status}
            isLast={isLast}
          >
            {renderBlockContent(blockType.component, block, {
              shower,
              onToggleShower: setShower,
              startMin,
              endMin,
            })}
          </TimelineRow>
        )
      })}
    </section>
  )
}

// ─── Block Content Renderer ──────────────────────────────────────────────────

function renderBlockContent(
  component: string,
  block: ScheduleBlock,
  props: {
    shower: boolean
    onToggleShower: (v: boolean) => void
    startMin: number
    endMin: number
  },
) {
  switch (component) {
    case 'MorningRoutine':
      return <MorningRoutine />

    case 'WorkBlock':
      return <WorkBlock id={block.instanceId} startMin={props.startMin} endMin={props.endMin} />

    case 'FitnessSection':
      return <FitnessSection shower={props.shower} onToggleShower={props.onToggleShower} />

    case 'MealTabs':
      return <MealTabs />

    case 'WaterTracker':
      return <WaterTracker />

    case 'FamilyTime':
      return <FamilyTime />

    case 'EveningWalk':
      return <EveningWalk />

    case 'HardStop':
      return (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <OctagonAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Hard stop.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {block.subtitle || 'Time to transition — close out and move on.'}
            </p>
          </div>
        </div>
      )

    case 'MovieNight':
      return (
        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
          <Film className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Relax, watch something good, and enjoy the evening.
          </p>
        </div>
      )

    case 'SupplementsMidday':
      return <SupplementChecklist time="midday" />

    case 'SupplementsEvening':
      return <SupplementChecklist time="evening" />

    case 'Supplements':
      return (
        <div className="grid gap-3">
          <SupplementChecklist time="morning" />
          <SupplementChecklist time="midday" />
          <SupplementChecklist time="evening" />
        </div>
      )

    case 'GenericBlock':
      return <GenericBlock id={block.instanceId} />

    default:
      return null
  }
}
