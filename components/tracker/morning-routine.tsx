'use client'

import { Check, NotebookPen, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/lib/use-local-storage'
import { HabitCheckbox } from './primitives'
import { RecurringTasksChecklist } from './recurring-tasks'

type TodoItem = { id: number; text: string; done: boolean }

export function MorningRoutine({
  coffee,
  onToggleCoffee,
}: {
  coffee: boolean
  onToggleCoffee: (v: boolean) => void
}) {
  const [accomplishments, setAccomplishments] = useLocalStorage<string[]>('accomplishments', [])
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', [])
  const [accDraft, setAccDraft] = useState('')
  const [todoDraft, setTodoDraft] = useState('')

  const addAccomplishment = () => {
    const text = accDraft.trim()
    if (!text) return
    setAccomplishments((prev) => [...prev, text])
    setAccDraft('')
  }

  const addTodo = () => {
    const text = todoDraft.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }])
    setTodoDraft('')
  }

  const toggleTodo = (id: number) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  return (
    <div className="grid gap-4">
      <HabitCheckbox
        checked={coffee}
        onChange={onToggleCoffee}
        label="Coffee"
        hint="Morning fuel"
      />

      <RecurringTasksChecklist />

      {/* What I accomplished */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Check className="size-4 text-primary" />
          What I got done
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={accDraft}
            onChange={(e) => setAccDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addAccomplishment()
            }}
            placeholder="e.g. Finished auth module, shipped PR #42"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button size="sm" onClick={addAccomplishment}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {accomplishments.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {accomplishments.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm text-foreground"
              >
                <span className="min-w-0 truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => setAccomplishments((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${item}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tonight's pickup notes */}
      <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <NotebookPen className="size-4 text-primary" />
          Pick up tonight
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Notes for what needs doing — so you can jump right in later.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={todoDraft}
            onChange={(e) => setTodoDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addTodo()
            }}
            placeholder="e.g. Fix pagination bug, review design doc"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <Button size="sm" onClick={addTodo}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {todos.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className="flex min-w-0 items-center gap-2 text-left"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                      todo.done
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Check className={`size-3.5 ${todo.done ? 'opacity-100' : 'opacity-0'}`} />
                  </span>
                  <span
                    className={`min-w-0 truncate ${
                      todo.done ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}
                  >
                    {todo.text}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTodos((prev) => prev.filter((t) => t.id !== todo.id))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${todo.text}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
