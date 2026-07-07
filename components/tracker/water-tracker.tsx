'use client'

import { Droplets, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { ProgressBar } from './primitives'

const GOAL = 8

export function WaterTracker() {
  const [glasses, setGlasses] = useLocalStorage('water-glasses', 0)

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <Droplets className="size-4 text-blue-500" />
        <span className="text-sm font-medium text-foreground">
          {glasses}/{GOAL} glasses
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setGlasses((prev) => Math.max(0, prev - 1))}
            disabled={glasses <= 0}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setGlasses((prev) => prev + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <ProgressBar value={(glasses / GOAL) * 100} />
    </div>
  )
}
