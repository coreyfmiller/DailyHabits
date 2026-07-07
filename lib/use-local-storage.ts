'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Returns today's date as YYYY-MM-DD string for use as a storage key prefix.
 * This ensures each day starts fresh.
 */
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * A localStorage-backed useState that scopes data to the current day.
 * On a new day, the state resets to the initial value.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const fullKey = `daily-habits:${todayKey()}:${key}`

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = localStorage.getItem(fullKey)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Sync to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(value))
    } catch {
      // Storage full or unavailable — silently fail
    }
  }, [fullKey, value])

  // Wrapper that matches the setState signature
  const set = useCallback(
    (action: T | ((prev: T) => T)) => {
      setValue(action)
    },
    []
  )

  return [value, set] as const
}
