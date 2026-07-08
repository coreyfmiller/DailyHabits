'use client'

// A single exercise in a routine
export type WorkoutExercise = {
  id: string
  name: string
  sets: string  // e.g. "3×12", "4×8", "30 sec"
}

// A named workout routine (e.g. "Push Day", "Pull Day", "Leg Day")
export type WorkoutRoutine = {
  id: string
  name: string
  days: number[]  // which days of the week this runs (0=Sun, 1=Mon, ..., 6=Sat)
  exercises: WorkoutExercise[]
}

// The full workout config
export type WorkoutConfig = {
  routines: WorkoutRoutine[]
}

const STORAGE_KEY = 'workout-config'

// Starter templates
const PUSH_PULL_TEMPLATE: WorkoutRoutine[] = [
  {
    id: 'push-legs',
    name: 'Push & Legs',
    days: [1, 3, 5],
    exercises: [
      { id: 'e1', name: 'Goblet Squats', sets: '3×12' },
      { id: 'e2', name: 'Dumbbell Bench Press', sets: '3×10' },
      { id: 'e3', name: 'Overhead Press', sets: '3×10' },
      { id: 'e4', name: 'Romanian Deadlifts', sets: '3×12' },
      { id: 'e5', name: 'Lateral Raises', sets: '3×15' },
      { id: 'e6', name: 'Tricep Kickbacks', sets: '3×12' },
    ],
  },
  {
    id: 'pull-arms',
    name: 'Pull & Arms',
    days: [2, 4],
    exercises: [
      { id: 'e7', name: 'Bent-Over Rows', sets: '3×10' },
      { id: 'e8', name: 'Single-Arm Rows', sets: '3×10' },
      { id: 'e9', name: 'Reverse Flyes', sets: '3×15' },
      { id: 'e10', name: 'Hammer Curls', sets: '3×12' },
      { id: 'e11', name: 'Bicep Curls', sets: '3×12' },
      { id: 'e12', name: 'Shrugs', sets: '3×15' },
    ],
  },
]

export const TEMPLATES: Record<string, { name: string; routines: WorkoutRoutine[] }> = {
  'push-pull': { name: 'Dumbbell Push/Pull Split', routines: PUSH_PULL_TEMPLATE },
  'full-body': {
    name: 'Full Body (3 days)',
    routines: [{
      id: 'full-body',
      name: 'Full Body',
      days: [1, 3, 5],
      exercises: [
        { id: 'fb1', name: 'Squats', sets: '3×12' },
        { id: 'fb2', name: 'Push-ups', sets: '3×15' },
        { id: 'fb3', name: 'Rows', sets: '3×10' },
        { id: 'fb4', name: 'Lunges', sets: '3×10 each' },
        { id: 'fb5', name: 'Plank', sets: '3×45 sec' },
        { id: 'fb6', name: 'Shoulder Press', sets: '3×10' },
      ],
    }],
  },
  'bodyweight': {
    name: 'Bodyweight (daily)',
    routines: [{
      id: 'bodyweight',
      name: 'Bodyweight',
      days: [1, 2, 3, 4, 5],
      exercises: [
        { id: 'bw1', name: 'Push-ups', sets: '4×20' },
        { id: 'bw2', name: 'Pull-ups', sets: '4×8' },
        { id: 'bw3', name: 'Air Squats', sets: '4×20' },
        { id: 'bw4', name: 'Dips', sets: '3×12' },
        { id: 'bw5', name: 'Plank', sets: '3×60 sec' },
      ],
    }],
  },
  'blank': { name: 'Start from scratch', routines: [] },
}

export function getWorkoutConfig(): WorkoutConfig {
  if (typeof window === 'undefined') return { routines: PUSH_PULL_TEMPLATE }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { routines: PUSH_PULL_TEMPLATE }
}

export function setWorkoutConfig(config: WorkoutConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {}
}

export function hasWorkoutConfig(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Get today's routine based on day of week. Returns null if rest day.
export function getTodayRoutine(): WorkoutRoutine | null {
  const config = getWorkoutConfig()
  const dow = new Date().getDay()
  return config.routines.find((r) => r.days.includes(dow)) ?? null
}
