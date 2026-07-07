'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MealLog } from './meal-log'

const TABS = [
  { key: 'breakfast' as const, label: 'B', full: 'Breakfast' },
  { key: 'lunch' as const, label: 'L', full: 'Lunch' },
  { key: 'supper' as const, label: 'S', full: 'Supper' },
]

export function MealTabs() {
  const [active, setActive] = useState<'breakfast' | 'lunch' | 'supper'>('breakfast')

  return (
    <div className="grid gap-3">
      <div className="flex gap-1 rounded-lg bg-secondary/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              active === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="hidden sm:inline">{tab.full}</span>
            <span className="sm:hidden">{tab.label}</span>
          </button>
        ))}
      </div>
      <MealLog mealSlot={active} />
    </div>
  )
}
