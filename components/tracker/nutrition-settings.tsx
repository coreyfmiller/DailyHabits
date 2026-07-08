'use client'

import { Apple, Flame, Timer } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  getNutritionConfig, setNutritionConfig, getWindowForProtocol,
  FASTING_LABELS, DIET_LABELS,
  type NutritionConfig, type FastingProtocol, type DietType,
} from '@/lib/nutrition-config'

export function NutritionSettings() {
  const [config, setConfig] = useState<NutritionConfig>(getNutritionConfig)

  const persist = useCallback((updated: NutritionConfig) => {
    setConfig(updated)
    setNutritionConfig(updated)
  }, [])

  const updateFasting = (protocol: FastingProtocol) => {
    const window = getWindowForProtocol(protocol)
    persist({
      ...config,
      fasting: protocol,
      ...(window ? { fastingWindowStart: window.start, fastingWindowEnd: window.end } : {}),
    })
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Apple className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Nutrition</h3>
      </div>

      {/* Fasting */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Timer className="mb-0.5 inline size-3" /> Intermittent Fasting
        </label>
        <div className="grid gap-1.5">
          {(Object.keys(FASTING_LABELS) as FastingProtocol[]).map((protocol) => (
            <button
              key={protocol}
              type="button"
              onClick={() => updateFasting(protocol)}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                config.fasting === protocol
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
              )}
            >
              {FASTING_LABELS[protocol]}
            </button>
          ))}
        </div>

        {/* Custom window inputs */}
        {(config.fasting === 'custom' || (config.fasting !== 'none' && config.fasting !== 'custom')) && config.fasting !== 'none' && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Window:</label>
            <input
              type="time"
              value={config.fastingWindowStart}
              onChange={(e) => persist({ ...config, fastingWindowStart: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="time"
              value={config.fastingWindowEnd}
              onChange={(e) => persist({ ...config, fastingWindowEnd: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
        )}
      </div>

      {/* Calorie Target */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Flame className="mb-0.5 inline size-3" /> Daily Calorie Target
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            step={100}
            value={config.calorieTarget || ''}
            onChange={(e) => persist({ ...config, calorieTarget: parseInt(e.target.value) || 0 })}
            placeholder="e.g. 2000"
            className="w-28 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <span className="text-xs text-muted-foreground">kcal (0 = no target)</span>
        </div>
      </div>

      {/* Diet Type */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Apple className="mb-0.5 inline size-3" /> Diet Approach
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(DIET_LABELS) as DietType[]).map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => persist({ ...config, dietType: diet })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                config.dietType === diet
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
              )}
            >
              {DIET_LABELS[diet]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
