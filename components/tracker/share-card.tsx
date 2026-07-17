'use client'

import { Share2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'

type MealEntry = { id: number }

export function ShareButton() {
  const [showCard, setShowCard] = useState(false)
  const [meals] = useLocalStorage<MealEntry[]>('meals', [])
  const [walked] = useLocalStorage<boolean>('walk-done', false)
  const [waterGlasses] = useLocalStorage<number>('water-glasses', 0)
  const [routineChecked] = useLocalStorage<string[]>('routine-checked', [])

  const habits = [
    { label: 'Meals', done: meals.length > 0 },
    { label: 'Walk', done: walked },
    { label: 'Water', done: waterGlasses >= 4 },
    { label: 'Routine', done: routineChecked.length > 0 },
  ]
  const done = habits.filter((h) => h.done).length
  const total = habits.length

  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

  const shareText = `RoutinePro.ai — ${today}\n${done}/${total} habits completed ✓\n${habits.filter(h => h.done).map(h => `✅ ${h.label}`).join('\n')}\n${habits.filter(h => !h.done).map(h => `⬜ ${h.label}`).join('\n')}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My RoutinePro.ai Day',
          text: shareText,
          url: 'https://routinepro.ai',
        })
      } catch {}
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        setShowCard(true)
        setTimeout(() => setShowCard(false), 3000)
      } catch {}
    }
  }

  if (done === 0) return null

  return (
    <>
      <Button size="sm" variant="ghost" onClick={handleShare} title="Share your progress">
        <Share2 className="size-4" />
      </Button>

      {/* Copied toast */}
      {showCard && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-primary/30 bg-card px-4 py-2 shadow-lg">
          <p className="text-xs text-foreground">Copied to clipboard ✓</p>
        </div>
      )}
    </>
  )
}
