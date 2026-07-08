'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Heart,
  Baby,
  Plane,
  Briefcase,
  Phone,
  Star,
  Flag,
  Zap,
  Music,
  Sun,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarTag = {
  id: string
  name: string
  icon: string
  color: string
}

// ─── Icon & Color maps ───────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Baby,
  Plane,
  Briefcase,
  Phone,
  Star,
  Flag,
  Zap,
  Music,
  Sun,
}

const ICON_NAMES = Object.keys(ICON_MAP)

const COLOR_OPTIONS = ['pink', 'blue', 'green', 'orange', 'purple', 'red'] as const

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; dot: string; pill: string; pillDark: string }> = {
  pink: { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-500', dot: 'bg-pink-500', pill: 'bg-pink-100 text-pink-700', pillDark: 'dark:bg-pink-950 dark:text-pink-300' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500', dot: 'bg-blue-500', pill: 'bg-blue-100 text-blue-700', pillDark: 'dark:bg-blue-950 dark:text-blue-300' },
  green: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-500', pill: 'bg-green-100 text-green-700', pillDark: 'dark:bg-green-950 dark:text-green-300' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500', pill: 'bg-orange-100 text-orange-700', pillDark: 'dark:bg-orange-950 dark:text-orange-300' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500', dot: 'bg-purple-500', pill: 'bg-purple-100 text-purple-700', pillDark: 'dark:bg-purple-950 dark:text-purple-300' },
  red: { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-500', pill: 'bg-red-100 text-red-700', pillDark: 'dark:bg-red-950 dark:text-red-300' },
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const TAGS_KEY = 'calendar-tags'
const ASSIGNMENTS_KEY = 'calendar-tag-assignments'

// ─── Storage helpers (exported for use elsewhere) ────────────────────────────

export function getCalendarTags(): CalendarTag[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TAGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setCalendarTags(tags: CalendarTag[]) {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
  } catch {}
}

function getAssignments(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setAssignments(assignments: Record<string, string[]>) {
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
  } catch {}
}

export function getTagsForDate(dateStr: string): CalendarTag[] {
  const tags = getCalendarTags()
  const assignments = getAssignments()
  const ids = assignments[dateStr] ?? []
  return tags.filter((t) => ids.includes(t.id))
}

export function getTagsForToday(): CalendarTag[] {
  const d = new Date()
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return getTagsForDate(key)
}

// ─── CalendarTagsManager (Settings UI) ──────────────────────────────────────

export function CalendarTagsManager() {
  const [tags, setTags] = useState<CalendarTag[]>([])
  const [creating, setCreating] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftIcon, setDraftIcon] = useState('Heart')
  const [draftColor, setDraftColor] = useState<string>('pink')

  useEffect(() => {
    setTags(getCalendarTags())
  }, [])

  const save = (updated: CalendarTag[]) => {
    setTags(updated)
    setCalendarTags(updated)
  }

  const addTag = () => {
    const name = draftName.trim()
    if (!name) return
    const newTag: CalendarTag = {
      id: `tag-${Date.now()}`,
      name,
      icon: draftIcon,
      color: draftColor,
    }
    save([...tags, newTag])
    setDraftName('')
    setDraftIcon('Heart')
    setDraftColor('pink')
    setCreating(false)
  }

  const deleteTag = (id: string) => {
    save(tags.filter((t) => t.id !== id))
    // Also remove from assignments
    const assignments = getAssignments()
    const updated: Record<string, string[]> = {}
    for (const [date, ids] of Object.entries(assignments)) {
      const filtered = ids.filter((tid) => tid !== id)
      if (filtered.length > 0) updated[date] = filtered
    }
    setAssignments(updated)
  }

  return (
    <section className="mb-8 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Calendar Tags</h2>
          <p className="text-xs text-muted-foreground">Create tags to mark special days on the calendar.</p>
        </div>
        {!creating && (
          <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New Tag
          </Button>
        )}
      </div>

      {creating && (
        <div className="mt-3 rounded-lg border border-border/60 bg-secondary/40 p-3 grid gap-3">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTag() }}
            placeholder="Tag name — e.g. Madelyn, Vacation, On-call"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
            autoFocus
          />

          {/* Icon picker */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {ICON_NAMES.map((name) => {
                const Icon = ICON_MAP[name]
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDraftIcon(name)}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md border transition-colors',
                      draftIcon === name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:bg-secondary/60'
                    )}
                    aria-label={name}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDraftColor(color)}
                  className={cn(
                    'size-8 rounded-md border-2 transition-colors',
                    COLOR_CLASSES[color].bg,
                    draftColor === color ? 'border-foreground ring-2 ring-ring/60' : 'border-transparent'
                  )}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={addTag} disabled={!draftName.trim()}>
              <Plus className="size-4" /> Add Tag
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {tags.map((tag) => {
            const Icon = ICON_MAP[tag.icon] ?? Heart
            const colors = COLOR_CLASSES[tag.color] ?? COLOR_CLASSES.pink
            return (
              <li key={tag.id} className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-2">
                <span className={cn('inline-flex items-center gap-2 text-sm font-medium', colors.text)}>
                  <Icon className="size-4" />
                  {tag.name}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTag(tag.id)}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Delete ${tag.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// ─── CalendarTagSelector (used in CalendarView) ─────────────────────────────

export function CalendarTagSelector({
  activeTagId,
  onSelectTag,
}: {
  activeTagId: string | null
  onSelectTag: (id: string | null) => void
}) {
  const [tags, setTags] = useState<CalendarTag[]>([])

  useEffect(() => {
    setTags(getCalendarTags())
  }, [])

  // Re-read tags when focus returns (in case user added tags in settings)
  useEffect(() => {
    const handler = () => setTags(getCalendarTags())
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [])

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground mr-1">Tag mode:</p>
      {tags.map((tag) => {
        const Icon = ICON_MAP[tag.icon] ?? Heart
        const colors = COLOR_CLASSES[tag.color] ?? COLOR_CLASSES.pink
        const isActive = activeTagId === tag.id
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(isActive ? null : tag.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
              isActive
                ? `${colors.pill} ${colors.pillDark} ring-2 ring-offset-1 ring-offset-background ${colors.border} ring-current`
                : `${colors.pill} ${colors.pillDark} opacity-60 hover:opacity-100`
            )}
          >
            <Icon className="size-3.5" />
            {tag.name}
          </button>
        )
      })}
      {activeTagId && (
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => onSelectTag(null)}>
          <X className="size-3" /> Done
        </Button>
      )}
    </div>
  )
}

// ─── Helpers for CalendarView to read/toggle assignments ─────────────────────

export function getTagIdsForDate(dateStr: string): string[] {
  return getAssignments()[dateStr] ?? []
}

export function toggleTagForDate(dateStr: string, tagId: string) {
  const assignments = getAssignments()
  const current = assignments[dateStr] ?? []
  if (current.includes(tagId)) {
    const updated = current.filter((id) => id !== tagId)
    if (updated.length === 0) {
      delete assignments[dateStr]
    } else {
      assignments[dateStr] = updated
    }
  } else {
    assignments[dateStr] = [...current, tagId]
  }
  setAssignments(assignments)
}
