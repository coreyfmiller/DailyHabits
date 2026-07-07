'use client'

import { Bell, BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSentToday(): Set<string> {
  try {
    const raw = localStorage.getItem(`notifications-sent:${todayKey()}`)
    if (raw) return new Set(JSON.parse(raw))
  } catch {}
  return new Set()
}

function markSent(id: string) {
  const sent = getSentToday()
  sent.add(id)
  localStorage.setItem(`notifications-sent:${todayKey()}`, JSON.stringify([...sent]))
}

function isWalkDone(): boolean {
  const prefix = `daily-habits:${todayKey()}`
  try {
    const wf = localStorage.getItem(`${prefix}:walked-with-family`)
    const sw = localStorage.getItem(`${prefix}:solo-walk`)
    return (wf && JSON.parse(wf) === true) || (sw && JSON.parse(sw) === true) || false
  } catch {
    return false
  }
}

function checkAndNotify() {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return

  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const sent = getSentToday()

  // At 5:45 PM (17:45) — eating window reminder
  if (minutes >= 17 * 60 + 45 && minutes < 17 * 60 + 46 && !sent.has('eating-window')) {
    new Notification('Daily Rhythm', { body: 'Eating window closing in 15 min' })
    markSent('eating-window')
  }

  // At 7:00 PM (19:00) — walk reminder
  if (minutes >= 19 * 60 && minutes < 19 * 60 + 1 && !sent.has('walk') && !isWalkDone()) {
    new Notification('Daily Rhythm', { body: 'Time for your walk 🚶' })
    markSent('walk')
  }
}

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const stored = localStorage.getItem('notifications-enabled')
    setEnabled(stored === 'true')
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    // Run check immediately and then every 60s
    checkAndNotify()
    const id = setInterval(checkAndNotify, 60_000)
    return () => clearInterval(id)
  }, [enabled])

  const toggle = async () => {
    if (!enabled) {
      // Enabling — request permission
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        setPermission(result)
        if (result !== 'granted') return
      } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        return
      }
      setEnabled(true)
      localStorage.setItem('notifications-enabled', 'true')
    } else {
      setEnabled(false)
      localStorage.setItem('notifications-enabled', 'false')
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-border/60 bg-secondary/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Notifications</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground">Daily reminders</p>
          <p className="text-xs text-muted-foreground">
            Eating window &amp; walk reminders
          </p>
        </div>
        <Button size="sm" variant={enabled ? 'default' : 'secondary'} onClick={toggle}>
          {enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          {enabled ? 'On' : 'Off'}
        </Button>
      </div>
      {permission === 'denied' && (
        <p className="mt-2 text-xs text-destructive">
          Notifications are blocked. Enable them in your browser settings.
        </p>
      )}
    </div>
  )
}
