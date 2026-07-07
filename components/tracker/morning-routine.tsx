'use client'

import { FocusTimer } from './focus-timer'
import { HabitCheckbox } from './primitives'

export function MorningRoutine({
  coffee,
  onToggleCoffee,
}: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
}) {
  return (
    <div className="grid gap-3">
      <HabitCheckbox
        checked={coffee}
        onChange={onToggleCoffee}
        label="Coffee"
        hint="Morning fuel"
      />
      <FocusTimer />
    </div>
  )
}
