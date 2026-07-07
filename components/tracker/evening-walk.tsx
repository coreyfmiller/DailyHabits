'use client'

import { Check, Footprints } from 'lucide-react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { HabitCheckbox } from './primitives'

export function EveningWalk({ walkedWithFamily }: { walkedWithFamily: boolean }) {
  const [soloWalk, setSoloWalk] = useLocalStorage('solo-walk', false)

  const walkDone = walkedWithFamily || soloWalk

  return (
    <div className="grid gap-3">
      {walkedWithFamily ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm">
          <Check className="size-4 text-primary" />
          <span className="text-foreground">Done — you walked with the family today.</span>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            No family walk today? Get your solo walk in — 30 to 60 minutes.
          </p>
          <HabitCheckbox
            checked={soloWalk}
            onChange={setSoloWalk}
            label="Solo evening walk"
            hint="30–60 min to clear your head"
          />
        </>
      )}

      {walkDone && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Footprints className="size-3.5 text-primary" />
          Daily walk complete.
        </p>
      )}
    </div>
  )
}
