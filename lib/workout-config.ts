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

export type WorkoutTemplate = {
  name: string
  description: string
  category: 'strength' | 'hypertrophy' | 'cardio' | 'flexibility' | 'bodyweight'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  daysPerWeek: number
  routines: WorkoutRoutine[]
}

export const TEMPLATES: Record<string, WorkoutTemplate> = {
  'push-pull': {
    name: 'Dumbbell Push/Pull Split',
    description: 'Classic 5-day split targeting push and pull movements with dumbbells. Great for home gyms.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    routines: PUSH_PULL_TEMPLATE,
  },
  'full-body': {
    name: 'Full Body (3 days)',
    description: 'Hit every muscle group 3x per week. Efficient and effective for building a balanced physique.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 3,
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
  'ppl': {
    name: 'Push/Pull/Legs (6 days)',
    description: 'The gold standard for muscle building. Each muscle group trained 2x per week with dedicated focus days.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 6,
    routines: [
      {
        id: 'ppl-push', name: 'Push Day', days: [1, 4],
        exercises: [
          { id: 'pp1', name: 'Barbell Bench Press', sets: '4×8' },
          { id: 'pp2', name: 'Overhead Press', sets: '3×10' },
          { id: 'pp3', name: 'Incline Dumbbell Press', sets: '3×10' },
          { id: 'pp4', name: 'Lateral Raises', sets: '3×15' },
          { id: 'pp5', name: 'Tricep Pushdown', sets: '3×12' },
          { id: 'pp6', name: 'Overhead Tricep Extension', sets: '3×12' },
        ],
      },
      {
        id: 'ppl-pull', name: 'Pull Day', days: [2, 5],
        exercises: [
          { id: 'pl1', name: 'Deadlift', sets: '4×5' },
          { id: 'pl2', name: 'Pull-ups', sets: '3×8' },
          { id: 'pl3', name: 'Barbell Row', sets: '3×10' },
          { id: 'pl4', name: 'Face Pulls', sets: '3×15' },
          { id: 'pl5', name: 'Barbell Curl', sets: '3×10' },
          { id: 'pl6', name: 'Hammer Curls', sets: '3×12' },
        ],
      },
      {
        id: 'ppl-legs', name: 'Leg Day', days: [3, 6],
        exercises: [
          { id: 'lg1', name: 'Barbell Squat', sets: '4×8' },
          { id: 'lg2', name: 'Romanian Deadlift', sets: '3×10' },
          { id: 'lg3', name: 'Leg Press', sets: '3×12' },
          { id: 'lg4', name: 'Leg Curl', sets: '3×12' },
          { id: 'lg5', name: 'Calf Raises', sets: '4×15' },
          { id: 'lg6', name: 'Bulgarian Split Squat', sets: '3×10 each' },
        ],
      },
    ],
  },
  'upper-lower': {
    name: 'Upper/Lower Split (4 days)',
    description: 'Simple and effective 4-day split. Great balance of volume and recovery for intermediate lifters.',
    category: 'strength',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    routines: [
      {
        id: 'ul-upper', name: 'Upper Body', days: [1, 4],
        exercises: [
          { id: 'ul1', name: 'Barbell Bench Press', sets: '4×8' },
          { id: 'ul2', name: 'Barbell Row', sets: '4×8' },
          { id: 'ul3', name: 'Overhead Press', sets: '3×10' },
          { id: 'ul4', name: 'Lat Pulldown', sets: '3×10' },
          { id: 'ul5', name: 'Dumbbell Curl', sets: '3×12' },
          { id: 'ul6', name: 'Tricep Pushdown', sets: '3×12' },
        ],
      },
      {
        id: 'ul-lower', name: 'Lower Body', days: [2, 5],
        exercises: [
          { id: 'ul7', name: 'Barbell Squat', sets: '4×8' },
          { id: 'ul8', name: 'Romanian Deadlift', sets: '3×10' },
          { id: 'ul9', name: 'Leg Press', sets: '3×12' },
          { id: 'ul10', name: 'Leg Curl', sets: '3×12' },
          { id: 'ul11', name: 'Calf Raises', sets: '4×15' },
          { id: 'ul12', name: 'Plank', sets: '3×60 sec' },
        ],
      },
    ],
  },
  'bodyweight': {
    name: 'Bodyweight (5 days)',
    description: 'No equipment needed. Build functional strength anywhere with progressive bodyweight movements.',
    category: 'bodyweight',
    difficulty: 'beginner',
    daysPerWeek: 5,
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
  'hiit': {
    name: 'HIIT Circuit (3 days)',
    description: 'High-intensity interval training for maximum calorie burn. Short, intense, and effective.',
    category: 'cardio',
    difficulty: 'intermediate',
    daysPerWeek: 3,
    routines: [{
      id: 'hiit-circuit',
      name: 'HIIT Circuit',
      days: [1, 3, 5],
      exercises: [
        { id: 'hiit1', name: 'Burpees', sets: '4×12' },
        { id: 'hiit2', name: 'Mountain Climbers', sets: '4×30 sec' },
        { id: 'hiit3', name: 'Jump Squats', sets: '4×15' },
        { id: 'hiit4', name: 'Battle Ropes', sets: '4×30 sec' },
        { id: 'hiit5', name: 'Box Jumps', sets: '4×10' },
        { id: 'hiit6', name: 'Kettlebell Swings', sets: '4×15' },
        { id: 'hiit7', name: 'Sprint Intervals', sets: '6×30 sec' },
      ],
    }],
  },
  'yoga-mobility': {
    name: 'Yoga & Mobility (daily)',
    description: 'Restore flexibility, reduce injury risk, and improve mind-body connection with daily mobility work.',
    category: 'flexibility',
    difficulty: 'beginner',
    daysPerWeek: 7,
    routines: [{
      id: 'yoga',
      name: 'Yoga & Mobility',
      days: [0, 1, 2, 3, 4, 5, 6],
      exercises: [
        { id: 'ym1', name: 'Sun Salutation A', sets: '5 rounds' },
        { id: 'ym2', name: 'Downward Dog Hold', sets: '3×45 sec' },
        { id: 'ym3', name: 'Pigeon Pose', sets: '2×60 sec each' },
        { id: 'ym4', name: 'Cat-Cow', sets: '3×10' },
        { id: 'ym5', name: 'Thread the Needle', sets: '2×30 sec each' },
        { id: 'ym6', name: 'Hip 90/90 Stretch', sets: '2×45 sec each' },
        { id: 'ym7', name: 'Thoracic Rotation', sets: '2×10 each' },
      ],
    }],
  },
  '5x5-strength': {
    name: '5×5 Strength (3 days)',
    description: 'Proven barbell strength program. Focus on the big compound lifts with progressive overload.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 3,
    routines: [
      {
        id: '5x5-a', name: 'Workout A', days: [1, 5],
        exercises: [
          { id: '5a1', name: 'Barbell Squat', sets: '5×5' },
          { id: '5a2', name: 'Barbell Bench Press', sets: '5×5' },
          { id: '5a3', name: 'Barbell Row', sets: '5×5' },
        ],
      },
      {
        id: '5x5-b', name: 'Workout B', days: [3],
        exercises: [
          { id: '5b1', name: 'Barbell Squat', sets: '5×5' },
          { id: '5b2', name: 'Overhead Press', sets: '5×5' },
          { id: '5b3', name: 'Deadlift', sets: '1×5' },
        ],
      },
    ],
  },
  'cardio': {
    name: 'Cardio Mix (5 days)',
    description: 'Varied cardio sessions to build endurance, improve heart health, and burn fat efficiently.',
    category: 'cardio',
    difficulty: 'beginner',
    daysPerWeek: 5,
    routines: [
      {
        id: 'cardio-steady', name: 'Steady State', days: [1, 3, 5],
        exercises: [
          { id: 'cs1', name: 'Running', sets: '30 min' },
          { id: 'cs2', name: 'Cycling', sets: '20 min' },
          { id: 'cs3', name: 'Cool-down Walk', sets: '10 min' },
        ],
      },
      {
        id: 'cardio-interval', name: 'Intervals', days: [2, 4],
        exercises: [
          { id: 'ci1', name: 'Sprint Intervals', sets: '10×30 sec' },
          { id: 'ci2', name: 'Jump Rope', sets: '3×3 min' },
          { id: 'ci3', name: 'Rowing Machine', sets: '10 min' },
          { id: 'ci4', name: 'Stair Climber', sets: '10 min' },
        ],
      },
    ],
  },
  'core': {
    name: 'Core Destroyer (4 days)',
    description: 'Dedicated core program for visible abs and a bulletproof midsection. Train the full core.',
    category: 'strength',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    routines: [{
      id: 'core-blast',
      name: 'Core Blast',
      days: [1, 2, 4, 5],
      exercises: [
        { id: 'cb1', name: 'Hanging Leg Raise', sets: '3×12' },
        { id: 'cb2', name: 'Ab Wheel Rollout', sets: '3×10' },
        { id: 'cb3', name: 'Russian Twists', sets: '3×20' },
        { id: 'cb4', name: 'Plank', sets: '3×60 sec' },
        { id: 'cb5', name: 'Bicycle Crunches', sets: '3×20' },
        { id: 'cb6', name: 'Cable Woodchop', sets: '3×12 each' },
        { id: 'cb7', name: 'Dead Bug', sets: '3×10 each' },
      ],
    }],
  },
  'stretching': {
    name: 'Stretching & Recovery',
    description: 'Essential flexibility routine for active recovery days. Helps prevent injury and improve range of motion.',
    category: 'flexibility',
    difficulty: 'beginner',
    daysPerWeek: 3,
    routines: [{
      id: 'stretch',
      name: 'Stretch & Recover',
      days: [2, 4, 6],
      exercises: [
        { id: 'st1', name: 'Quad Stretch', sets: '2×30 sec each' },
        { id: 'st2', name: 'Hamstring Stretch', sets: '2×30 sec each' },
        { id: 'st3', name: 'Hip Flexor Stretch', sets: '2×30 sec each' },
        { id: 'st4', name: 'Chest Doorway Stretch', sets: '2×30 sec' },
        { id: 'st5', name: 'Lat Stretch', sets: '2×30 sec each' },
        { id: 'st6', name: 'Neck Rolls', sets: '2×10 each' },
        { id: 'st7', name: "Child's Pose", sets: '2×45 sec' },
        { id: 'st8', name: 'Foam Roll (Full Body)', sets: '5 min' },
      ],
    }],
  },
  'blank': {
    name: 'Start from scratch',
    description: 'Build your own program from the ground up with our exercise library.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 0,
    routines: [],
  },
}

export function getWorkoutConfig(): WorkoutConfig {
  if (typeof window === 'undefined') return { routines: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { routines: [] }
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
