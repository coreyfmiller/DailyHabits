'use client'

import { Download, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'

export function DataManager() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data: Record<string, string> = {}
    const keysToExport = ['recurring-tasks', 'calendar-events', 'calendar-tags', 'calendar-tag-assignments', 'theme']

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (key.startsWith('daily-habits:') || keysToExport.includes(key)) {
        data[key] = localStorage.getItem(key) ?? ''
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const today = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-rhythm-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (typeof data === 'object' && data !== null) {
          for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value as string)
          }
          window.location.reload()
        }
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    // Reset the input so the same file can be re-imported
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (!confirm('This will delete ALL your data — habits, meals, schedule, settings, everything. This cannot be undone. Are you sure?')) return
    localStorage.clear()
    window.location.href = '/app/setup'
  }

  return (
    <div className="mt-8 rounded-lg border border-border/60 bg-secondary/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Data Management</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <Download className="size-4" />
          Download Data
        </Button>
        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload className="size-4" />
          Import Data
        </Button>
        <Button size="sm" variant="destructive" onClick={handleClearAll}>
          Clear All Data
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Export all your tracked data as JSON, or import a previous backup.
      </p>
    </div>
  )
}
