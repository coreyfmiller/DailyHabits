'use client'

import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'

type MealEntry = { id: number }

export function DailyProgress() {
  const [coffee] = useLocalStorage<boolean>('coffee', false)
  const [shower] = useLocalStorage<boolean>('shower', false)
  const [breakfast] = useLocalStorage<MealEntry[]>('meals-breakfast', [])
  const [lunch] = useLocalStorage<MealEntry[]>('meals-lunch', [])
  const [supper] = useLocalStorage<MealEntry[]>('meals-supper', [])
  const [walkedFamily] = useLocalStorage<boolean>('walked-with-family', false)
  const [soloWalk] = useLocalStorage<boolean>('solo-walk', false)
  const [routine] = useLocalStorage<{ done: boolean }[]>('dumbbell-routine', [])

  const habits = [
    coffee,
    shower,
    breakfast.length > 0,
    lunch.length > 0,
    supper.length > 0,
    routine.some((e) => e.done),
    walkedFamily || soloWalk,
  ]

  const done = habits.filter(Boolean).length
  const total = habits.length
  const pct = total > 0 ? (done / total) * 100 : 0
  const allDone = done === total
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  if (done === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        allDone && 'animate-pulse rounded-full ring-2 ring-green-400/50'
      )}
    >
      <svg width="44" height="44" className="shrink-0 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={allDone ? 'text-green-500' : 'text-primary'}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        className={cn(
          'font-mono text-sm font-semibold tabular-nums',
          allDone ? 'text-green-600 dark:text-green-400' : 'text-foreground'
        )}
      >
        {done}/{total}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">habits</span>
      </span>
    </div>
  )
}
