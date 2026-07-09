'use client'

/**
 * Run data migrations to handle schema changes.
 * This runs once on app load and is idempotent.
 */
export function runMigrations() {
  if (typeof window === 'undefined') return

  migrateScheduleBlocks()
  migrateMealData()
  markMigrated()
}

const MIGRATION_KEY = 'migrations-v1'

function hasMigrated(): boolean {
  return localStorage.getItem(MIGRATION_KEY) === 'done'
}

function markMigrated() {
  localStorage.setItem(MIGRATION_KEY, 'done')
}

/**
 * Migrate old schedule blocks:
 * - Remove supplements-midday / supplements-evening (replaced by unified "supplements")
 * - Remove personal-work (replaced by "work" or "deep-work")
 * - Ensure only one "meals" block exists (remove duplicates from old breakfast/lunch/supper separation)
 */
function migrateScheduleBlocks() {
  const raw = localStorage.getItem('schedule-config')
  if (!raw) return

  try {
    const config = JSON.parse(raw)
    let changed = false

    for (const key of ['weekday', 'weekend'] as const) {
      if (!Array.isArray(config[key])) continue

      const original = config[key].length

      // Replace deprecated block IDs
      config[key] = config[key].map((block: { blockTypeId: string; [k: string]: unknown }) => {
        // Convert personal-work to work
        if (block.blockTypeId === 'personal-work') {
          block.blockTypeId = 'work'
          changed = true
        }
        // Convert supplements-midday/evening to unified supplements
        if (block.blockTypeId === 'supplements-midday' || block.blockTypeId === 'supplements-evening') {
          block.blockTypeId = 'supplements'
          changed = true
        }
        return block
      })

      // Deduplicate: only keep one "supplements" block and one "meals" block
      const seen = new Set<string>()
      config[key] = config[key].filter((block: { blockTypeId: string }) => {
        if (block.blockTypeId === 'supplements' || block.blockTypeId === 'meals') {
          if (seen.has(block.blockTypeId)) return false
          seen.add(block.blockTypeId)
        }
        return true
      })

      if (config[key].length !== original) changed = true
    }

    if (changed) {
      localStorage.setItem('schedule-config', JSON.stringify(config))
    }
  } catch {}
}

/**
 * Migrate per-slot meal data (meals-breakfast, meals-lunch, meals-supper)
 * into the unified "meals" key for today.
 */
function migrateMealData() {
  const d = new Date()
  const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const prefix = `daily-habits:${todayKey}`

  const unifiedKey = `${prefix}:meals`
  const existing = localStorage.getItem(unifiedKey)
  let unified: unknown[] = []

  if (existing) {
    try { unified = JSON.parse(existing) } catch {}
  }

  // Merge from old per-slot keys
  for (const slot of ['meals-breakfast', 'meals-lunch', 'meals-supper']) {
    const slotKey = `${prefix}:${slot}`
    const raw = localStorage.getItem(slotKey)
    if (!raw) continue
    try {
      const entries = JSON.parse(raw)
      if (Array.isArray(entries) && entries.length > 0) {
        unified = [...unified, ...entries]
        localStorage.removeItem(slotKey)
      }
    } catch {}
  }

  if (unified.length > 0) {
    localStorage.setItem(unifiedKey, JSON.stringify(unified))
  }
}
