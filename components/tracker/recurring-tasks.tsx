'use client'

import { Check, Edit2, Plus, Repeat, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { cn } from '@/lib/utils'
import { HabitCheckbox } from './primitives'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecurringTask = {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly'
  /** For weekly: which days to show (0=Sun, 1=Mon, ..., 6=Sat) */
  days: number[]
  /** ISO string — used as epoch for biweekly week counting */
  startDate: string
  /** Optional hint shown below label */
  hint?: string
  /** Optional group name for biweekly alternating pairs (e.g. "trash") */
  group?: string
}

const STORAGE_KEY = 'recurring-tasks'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredTasks(): RecurringTask[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredTasks(tasks: RecurringTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {}
}

/** Get the ISO week number difference between two dates */
function weeksBetween(a: Date, b: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const startOfWeek = (d: Date) => {
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.getFullYear(), d.getMonth(), diff)
  }
  const weekA = startOfWeek(a).getTime()
  const weekB = startOfWeek(b).getTime()
  return Math.floor(Math.abs(weekB - weekA) / msPerWeek)
}

/**
 * Returns which recurring tasks apply today.
 * For biweekly tasks with a group: even weeks show even-indexed tasks in the group,
 * odd weeks show odd-indexed tasks.
 */
export function getRecurringTasksForToday(): RecurringTask[] {
  const tasks = getStoredTasks()
  const today = new Date()
  const dayOfWeek = today.getDay()

  // Group biweekly tasks by their group name
  const biweeklyGroups: Record<string, RecurringTask[]> = {}

  return tasks.filter((task) => {
    if (task.frequency === 'daily') return true

    if (task.frequency === 'weekly') {
      return task.days.includes(dayOfWeek)
    }

    if (task.frequency === 'biweekly') {
      // Must also match the day
      if (!task.days.includes(dayOfWeek)) return false

      const startDate = new Date(task.startDate)
      const weeks = weeksBetween(startDate, today)
      const isEvenWeek = weeks % 2 === 0

      if (task.group) {
        // For grouped biweekly tasks, determine position in group
        if (!biweeklyGroups[task.group]) {
          biweeklyGroups[task.group] = tasks.filter(
            (t) => t.frequency === 'biweekly' && t.group === task.group
          )
        }
        const groupTasks = biweeklyGroups[task.group]
        const idx = groupTasks.findIndex((t) => t.id === task.id)
        // Even index shows on even weeks, odd index shows on odd weeks
        return idx % 2 === 0 ? isEvenWeek : !isEvenWeek
      }

      // Ungrouped biweekly: show on even weeks
      return isEvenWeek
    }

    return false
  })
}

// ─── RecurringTasksChecklist ──────────────────────────────────────────────────

export function RecurringTasksChecklist() {
  const [tasks, setTasks] = useState<RecurringTask[]>([])

  useEffect(() => {
    setTasks(getRecurringTasksForToday())
  }, [])

  if (tasks.length === 0) return null

  return (
    <div className="grid gap-2">
      {tasks.map((task) => (
        <RecurringCheckItem key={task.id} task={task} />
      ))}
    </div>
  )
}

function RecurringCheckItem({ task }: { task: RecurringTask }) {
  const [checked, setChecked] = useLocalStorage(`recurring-done-${task.id}`, false)

  return (
    <HabitCheckbox
      checked={checked}
      onChange={setChecked}
      label={task.name}
      hint={task.hint}
    />
  )
}

// ─── RecurringTasksManager ────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type EditingTask = Omit<RecurringTask, 'id'> & { id?: string }

const emptyTask: EditingTask = {
  name: '',
  frequency: 'daily',
  days: [],
  startDate: new Date().toISOString().slice(0, 10),
  hint: '',
  group: '',
}

export function RecurringTasksManager() {
  const [tasks, setTasks] = useState<RecurringTask[]>(getStoredTasks)
  const [editing, setEditing] = useState<EditingTask | null>(null)

  const save = useCallback(
    (updated: RecurringTask[]) => {
      setTasks(updated)
      setStoredTasks(updated)
    },
    []
  )

  const startAdd = () => setEditing({ ...emptyTask })

  const startEdit = (task: RecurringTask) =>
    setEditing({ ...task })

  const deleteTask = (id: string) => save(tasks.filter((t) => t.id !== id))

  const handleSave = () => {
    if (!editing || !editing.name.trim()) return
    const id = editing.id || `rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const saved: RecurringTask = {
      id,
      name: editing.name.trim(),
      frequency: editing.frequency,
      days: editing.days,
      startDate: editing.startDate,
      hint: editing.hint?.trim() || undefined,
      group: editing.group?.trim() || undefined,
    }
    if (editing.id) {
      save(tasks.map((t) => (t.id === id ? saved : t)))
    } else {
      save([...tasks, saved])
    }
    setEditing(null)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recurring Tasks</h3>
        </div>
        <Button size="sm" variant="secondary" onClick={startAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Task list */}
      {tasks.length === 0 && !editing && (
        <p className="text-xs text-muted-foreground">
          No recurring tasks yet. Add one to get started.
        </p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{task.name}</p>
            <p className="text-xs text-muted-foreground">
              {task.frequency === 'daily' && 'Every day'}
              {task.frequency === 'weekly' && `Weekly: ${task.days.map((d) => DAY_LABELS[d]).join(', ')}`}
              {task.frequency === 'biweekly' && `Biweekly: ${task.days.map((d) => DAY_LABELS[d]).join(', ')}${task.group ? ` (group: ${task.group})` : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => startEdit(task)}
              className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Edit ${task.name}`}
            >
              <Edit2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => deleteTask(task.id)}
              className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Delete ${task.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add/Edit form */}
      {editing && (
        <div className="rounded-lg border border-primary/30 bg-card p-4 shadow-sm">
          <div className="grid gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Shave head, Take out garbage"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Hint (optional)</label>
              <input
                value={editing.hint ?? ''}
                onChange={(e) => setEditing({ ...editing, hint: e.target.value })}
                placeholder="e.g. Sunday fresh"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Frequency</label>
              <div className="mt-1 flex gap-2">
                {(['daily', 'weekly', 'biweekly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setEditing({ ...editing, frequency: freq, days: freq === 'daily' ? [] : editing.days })}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      editing.frequency === freq
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {(editing.frequency === 'weekly' || editing.frequency === 'biweekly') && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Days</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        const days = editing.days.includes(idx)
                          ? editing.days.filter((d) => d !== idx)
                          : [...editing.days, idx]
                        setEditing({ ...editing, days: days.sort() })
                      }}
                      className={cn(
                        'flex size-9 items-center justify-center rounded-md border text-xs font-medium transition-colors',
                        editing.days.includes(idx)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {editing.frequency === 'biweekly' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Does this happen this week?</label>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Set startDate to this week's Sunday so "this week" = even
                        const d = new Date()
                        d.setDate(d.getDate() - d.getDay())
                        setEditing({ ...editing, startDate: d.toISOString().slice(0, 10) })
                      }}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                        (() => {
                          const d = new Date()
                          d.setDate(d.getDate() - d.getDay())
                          return editing.startDate === d.toISOString().slice(0, 10)
                        })()
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Yes, this week
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Set startDate to next week's Sunday so "this week" = odd (won't show)
                        const d = new Date()
                        d.setDate(d.getDate() - d.getDay() + 7)
                        setEditing({ ...editing, startDate: d.toISOString().slice(0, 10) })
                      }}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                        (() => {
                          const d = new Date()
                          d.setDate(d.getDate() - d.getDay() + 7)
                          return editing.startDate === d.toISOString().slice(0, 10)
                        })()
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      No, next week
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">This determines the alternating schedule going forward.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Group (optional — pairs alternating tasks)</label>
                  <input
                    value={editing.group ?? ''}
                    onChange={(e) => setEditing({ ...editing, group: e.target.value })}
                    placeholder="e.g. trash — tasks in the same group alternate"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Put garbage & recycling in the same group and they'll swap each week.</p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!editing.name.trim()}>
                <Check className="size-4" />
                {editing.id ? 'Save' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
