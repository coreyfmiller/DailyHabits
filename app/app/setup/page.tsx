'use client'

import { ArrowDown, ArrowUp, ChevronLeft, Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BLOCK_REGISTRY } from '@/lib/block-registry'
import type { BlockType } from '@/lib/block-registry'
import {
  getScheduleConfig,
  hasScheduleConfig,
  setScheduleConfig,
} from '@/lib/schedule-config'
import type { ScheduleBlock, ScheduleConfig } from '@/lib/schedule-config'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  routine: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  health: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  meals: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  social: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  rest: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
}

export default function SetupPage() {
  const router = useRouter()
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>('weekday')
  const [config, setConfig] = useState<ScheduleConfig>({
    weekday: [],
    weekend: [],
  })

  useEffect(() => {
    if (!hasScheduleConfig()) {
      setIsFirstTime(true)
    } else {
      setConfig(getScheduleConfig())
    }
  }, [])

  const currentBlocks = activeTab === 'weekday' ? config.weekday : config.weekend

  function updateBlocks(blocks: ScheduleBlock[]) {
    setConfig((prev) => ({
      ...prev,
      [activeTab]: blocks,
    }))
  }

  function addBlock(blockType: BlockType) {
    const id = `${activeTab === 'weekday' ? 'wd' : 'we'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newBlock: ScheduleBlock = {
      instanceId: id,
      blockTypeId: blockType.id,
      label: blockType.name,
      startTime: blockType.defaultStartTime,
      endTime: blockType.defaultEndTime,
      subtitle: blockType.description,
    }
    updateBlocks([...currentBlocks, newBlock])
  }

  function removeBlock(instanceId: string) {
    updateBlocks(currentBlocks.filter((b) => b.instanceId !== instanceId))
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= currentBlocks.length) return
    const updated = [...currentBlocks]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    updateBlocks(updated)
  }

  function updateBlock(instanceId: string, updates: Partial<ScheduleBlock>) {
    updateBlocks(
      currentBlocks.map((b) => (b.instanceId === instanceId ? { ...b, ...updates } : b)),
    )
  }

  function handleSave() {
    setScheduleConfig(config)
    router.push('/app')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-16 sm:px-6">
      <header className="mb-8 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <Button size="sm" variant="secondary" onClick={() => router.push('/app')}>
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Build Your Schedule</h1>
        {isFirstTime && (
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome to RoutinePro.ai! Let&apos;s build your daily schedule. Pick from the blocks below
            and arrange them in the order you want.
          </p>
        )}
      </header>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-secondary/60 p-1">
        {(['weekday', 'weekend'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Current schedule */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Current Schedule ({currentBlocks.length} blocks)
        </h2>

        {currentBlocks.length === 0 && (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-6 text-center">
            No blocks yet. Add some from below!
          </p>
        )}

        <div className="grid gap-2">
          {currentBlocks.map((block, index) => (
            <div
              key={block.instanceId}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-card p-3"
            >
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === currentBlocks.length - 1}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
              </div>

              {/* Block info — editable */}
              <div className="min-w-0 flex-1 grid gap-1.5">
                <input
                  type="text"
                  value={block.label}
                  onChange={(e) => updateBlock(block.instanceId, { label: e.target.value })}
                  className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={block.startTime}
                    onChange={(e) => updateBlock(block.instanceId, { startTime: e.target.value })}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                  />
                  <span className="text-xs text-muted-foreground">–</span>
                  <input
                    type="time"
                    value={block.endTime}
                    onChange={(e) => updateBlock(block.instanceId, { endTime: e.target.value })}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                  />
                </div>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeBlock(block.instanceId)}
                className="rounded p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${block.label}`}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add a Block */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Add a Block</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {BLOCK_REGISTRY.map((blockType) => (
            <button
              key={blockType.id}
              type="button"
              onClick={() => addBlock(blockType)}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Plus className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{blockType.name}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium capitalize',
                      CATEGORY_COLORS[blockType.category] ?? 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {blockType.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{blockType.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={handleSave}>
          <Save className="size-4" />
          Save Schedule
        </Button>
      </div>
    </main>
  )
}
