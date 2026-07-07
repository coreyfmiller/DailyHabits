'use client'

import { useLocalStorage } from '@/lib/use-local-storage'

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
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  if (done === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      <svg width="36" height="36" className="shrink-0 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={done === total ? 'text-green-500' : 'text-primary'}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="font-mono text-xs font-medium tabular-nums text-foreground">
        {done}/{total}
      </span>
    </div>
  )
}
