'use client'

import { Coffee, Droplets } from 'lucide-react'
import { FocusTimer } from './focus-timer'
import { HabitCheckbox } from './primitives'

export function MorningRoutine({
  shower,
  coffee,
  onToggleShower,
  onToggleCoffee,
}: {
  shower: boolean
  coffee: boolean
  onToggleShower: (v: boolean) => void
  onToggleCoffee: (v: boolean) => void
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <HabitCheckbox
          checked={shower}
          onChange={onToggleShower}
          label="Shower"
          hint="Wake up & reset"
        />
        <HabitCheckbox
          checked={coffee}
          onChange={onToggleCoffee}
          label="Coffee"
          hint="Morning fuel"
        />
      </div>
      <FocusTimer />
    </div>
  )
}
