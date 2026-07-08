'use client'

// Block type definition — each represents a type of timeline section a user can add
export type BlockType = {
  id: string                    // unique identifier e.g. 'morning-routine', 'work', 'fitness'
  name: string                  // display name e.g. 'Morning Routine'
  description: string           // short description for the config screen
  icon: string                  // lucide icon name
  defaultStartTime: string      // e.g. '06:30'
  defaultEndTime: string        // e.g. '08:30'
  repeatable: boolean           // can user add multiple instances? (e.g. multiple work blocks)
  category: 'routine' | 'work' | 'health' | 'meals' | 'social' | 'rest'
  component: string             // component key for the renderer
}

// All available block types users can add to their schedule
export const BLOCK_REGISTRY: BlockType[] = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Start your day — coffee, supplements, intentions.',
    icon: 'Sunrise',
    defaultStartTime: '06:30',
    defaultEndTime: '08:30',
    repeatable: false,
    category: 'routine',
    component: 'MorningRoutine',
  },
  {
    id: 'work',
    name: 'Work Block',
    description: 'Focused work session with progress tracking.',
    icon: 'Briefcase',
    defaultStartTime: '09:00',
    defaultEndTime: '17:00',
    repeatable: true,
    category: 'work',
    component: 'WorkBlock',
  },
  {
    id: 'personal-work',
    name: 'Personal Work',
    description: 'Time for your own business or projects.',
    icon: 'Laptop',
    defaultStartTime: '08:30',
    defaultEndTime: '12:00',
    repeatable: true,
    category: 'work',
    component: 'WorkBlock',
  },
  {
    id: 'meals',
    name: 'Meals',
    description: 'Track breakfast, lunch, and supper with AI.',
    icon: 'Utensils',
    defaultStartTime: '10:00',
    defaultEndTime: '18:00',
    repeatable: false,
    category: 'meals',
    component: 'MealTabs',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'Dumbbell routine with rotating push/pull splits.',
    icon: 'Dumbbell',
    defaultStartTime: '12:00',
    defaultEndTime: '13:00',
    repeatable: false,
    category: 'health',
    component: 'FitnessSection',
  },
  {
    id: 'water',
    name: 'Water Tracker',
    description: 'Stay hydrated — track 8 glasses a day.',
    icon: 'Droplets',
    defaultStartTime: '06:30',
    defaultEndTime: '21:00',
    repeatable: false,
    category: 'health',
    component: 'WaterTracker',
  },
  {
    id: 'family-time',
    name: 'Family Time',
    description: 'Be present. Log activities together.',
    icon: 'Users',
    defaultStartTime: '18:00',
    defaultEndTime: '20:00',
    repeatable: false,
    category: 'social',
    component: 'FamilyTime',
  },
  {
    id: 'walk',
    name: 'Daily Walk',
    description: '30–60 min walk, solo or with family.',
    icon: 'Footprints',
    defaultStartTime: '18:00',
    defaultEndTime: '21:00',
    repeatable: false,
    category: 'health',
    component: 'EveningWalk',
  },
  {
    id: 'hard-stop',
    name: 'Hard Stop',
    description: 'No more work or eating after this point.',
    icon: 'OctagonAlert',
    defaultStartTime: '18:00',
    defaultEndTime: '18:00',
    repeatable: false,
    category: 'routine',
    component: 'HardStop',
  },
  {
    id: 'movie-night',
    name: 'Movie / Wind Down',
    description: 'Relax and wind down for the night.',
    icon: 'Film',
    defaultStartTime: '20:00',
    defaultEndTime: '22:00',
    repeatable: false,
    category: 'rest',
    component: 'MovieNight',
  },
  {
    id: 'supplements-midday',
    name: 'Midday Supplements',
    description: 'Take your midday supplements.',
    icon: 'Pill',
    defaultStartTime: '12:00',
    defaultEndTime: '13:00',
    repeatable: false,
    category: 'health',
    component: 'SupplementsMidday',
  },
  {
    id: 'supplements-evening',
    name: 'Evening Supplements',
    description: 'Take your evening supplements.',
    icon: 'Pill',
    defaultStartTime: '19:00',
    defaultEndTime: '20:00',
    repeatable: false,
    category: 'health',
    component: 'SupplementsEvening',
  },
]

export function getBlockType(id: string): BlockType | undefined {
  return BLOCK_REGISTRY.find((b) => b.id === id)
}
