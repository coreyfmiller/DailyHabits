'use client'

// Block type definition — each represents a type of timeline section a user can add
export type BlockType = {
  id: string                    // unique identifier e.g. 'morning-routine', 'work', 'fitness'
  name: string                  // display name e.g. 'Morning Routine'
  description: string           // short description for the config screen
  icon: string                  // lucide icon name
  defaultStartTime: string      // e.g. '06:30'
  defaultEndTime: string        // e.g. '08:30'
  defaultDuration: number       // minutes — used for smart start-time inference
  repeatable: boolean           // can user add multiple instances? (e.g. multiple work blocks)
  category: 'routine' | 'work' | 'health' | 'meals' | 'social' | 'rest' | 'focus' | 'custom'
  component: string             // component key for the renderer
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK REGISTRY
//
// Design philosophy:
// - Every block should be useful to a wide audience, not just one person's life
// - Blocks are building blocks — keep them atomic and composable
// - Users combine blocks to create THEIR day, not our idea of a day
// - "GenericBlock" is the catch-all — notes + checklist for anything custom
// - Specialized components (MealTabs, WaterTracker, etc.) exist where
//   tracking UI genuinely adds value over a simple checklist
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCK_REGISTRY: BlockType[] = [
  // ─── Morning & Evening Anchors ──────────────────────────────────────────────
  // These are the bookends most people build around
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Wake up ritual — sleep log, coffee, intentions, and prep for the day.',
    icon: 'Sunrise',
    defaultStartTime: '06:30',
    defaultEndTime: '08:00',
    defaultDuration: 90,
    repeatable: false,
    category: 'routine',
    component: 'MorningRoutine',
  },
  {
    id: 'bedtime-routine',
    name: 'Bedtime Routine',
    description: 'Wind down — no screens, skincare, reading, prepare for sleep.',
    icon: 'BedDouble',
    defaultStartTime: '21:30',
    defaultEndTime: '22:30',
    defaultDuration: 60,
    repeatable: false,
    category: 'rest',
    component: 'GenericBlock',
  },

  // ─── Work & Productivity ────────────────────────────────────────────────────
  // Repeatable so people can have morning + afternoon blocks, day job + side project
  {
    id: 'work',
    name: 'Work Block',
    description: 'Focused work session with progress tracking and time awareness.',
    icon: 'Briefcase',
    defaultStartTime: '09:00',
    defaultEndTime: '12:00',
    defaultDuration: 180,
    repeatable: true,
    category: 'work',
    component: 'WorkBlock',
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: 'Distraction-free focus. No meetings, no messages, just output.',
    icon: 'Target',
    defaultStartTime: '09:00',
    defaultEndTime: '11:00',
    defaultDuration: 120,
    repeatable: true,
    category: 'work',
    component: 'WorkBlock',
  },
  {
    id: 'study',
    name: 'Study / Learning',
    description: 'Courses, textbooks, certifications, or skill development.',
    icon: 'GraduationCap',
    defaultStartTime: '19:00',
    defaultEndTime: '20:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'work',
    component: 'GenericBlock',
  },

  // ─── Health & Fitness ───────────────────────────────────────────────────────
  {
    id: 'fitness',
    name: 'Workout',
    description: 'Your training session — pulls from your configured routine.',
    icon: 'Dumbbell',
    defaultStartTime: '07:00',
    defaultEndTime: '08:00',
    defaultDuration: 60,
    repeatable: false,
    category: 'health',
    component: 'FitnessSection',
  },
  {
    id: 'walk',
    name: 'Walk',
    description: 'Get outside. 20–60 minutes, solo or with someone.',
    icon: 'Footprints',
    defaultStartTime: '18:00',
    defaultEndTime: '19:00',
    defaultDuration: 45,
    repeatable: true,
    category: 'health',
    component: 'EveningWalk',
  },
  {
    id: 'water',
    name: 'Water Tracker',
    description: 'Track hydration throughout the day. Aim for 8 glasses.',
    icon: 'Droplets',
    defaultStartTime: '06:30',
    defaultEndTime: '21:00',
    defaultDuration: 0, // all-day block
    repeatable: false,
    category: 'health',
    component: 'WaterTracker',
  },
  {
    id: 'supplements',
    name: 'Supplements',
    description: 'Track morning, midday, and evening supplements in one place.',
    icon: 'Pill',
    defaultStartTime: '07:00',
    defaultEndTime: '21:00',
    defaultDuration: 0, // all-day block
    repeatable: false,
    category: 'health',
    component: 'Supplements',
  },
  {
    id: 'stretching',
    name: 'Stretching / Mobility',
    description: 'Flexibility work, foam rolling, yoga, or active recovery.',
    icon: 'Activity',
    defaultStartTime: '07:00',
    defaultEndTime: '07:20',
    defaultDuration: 20,
    repeatable: true,
    category: 'health',
    component: 'GenericBlock',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Breathwork, guided meditation, or mindfulness practice.',
    icon: 'Brain',
    defaultStartTime: '06:30',
    defaultEndTime: '06:45',
    defaultDuration: 15,
    repeatable: true,
    category: 'health',
    component: 'GenericBlock',
  },

  // ─── Meals & Nutrition ──────────────────────────────────────────────────────
  {
    id: 'meals',
    name: 'Meals',
    description: 'Log breakfast, lunch, and dinner with calorie tracking.',
    icon: 'Utensils',
    defaultStartTime: '07:00',
    defaultEndTime: '20:00',
    defaultDuration: 0, // all-day block
    repeatable: false,
    category: 'meals',
    component: 'MealTabs',
  },

  // ─── Focus & Personal Development ──────────────────────────────────────────
  {
    id: 'journaling',
    name: 'Journaling',
    description: 'Gratitude, morning pages, reflection, or free writing.',
    icon: 'BookOpen',
    defaultStartTime: '06:45',
    defaultEndTime: '07:15',
    defaultDuration: 30,
    repeatable: true,
    category: 'focus',
    component: 'GenericBlock',
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Books, articles, or long-form content. Track what you read.',
    icon: 'BookMarked',
    defaultStartTime: '21:00',
    defaultEndTime: '21:30',
    defaultDuration: 30,
    repeatable: true,
    category: 'focus',
    component: 'GenericBlock',
  },
  {
    id: 'creative',
    name: 'Creative Time',
    description: 'Music, art, writing, coding side projects, or any creative pursuit.',
    icon: 'Palette',
    defaultStartTime: '19:00',
    defaultEndTime: '20:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'focus',
    component: 'GenericBlock',
  },
  {
    id: 'screen-free',
    name: 'Screen-Free Time',
    description: 'Phones and screens away. Be present with yourself or others.',
    icon: 'MonitorOff',
    defaultStartTime: '20:00',
    defaultEndTime: '21:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'focus',
    component: 'GenericBlock',
  },

  // ─── Social & Relationships ─────────────────────────────────────────────────
  {
    id: 'family-time',
    name: 'Family Time',
    description: 'Dedicated presence with family. Log activities together.',
    icon: 'Users',
    defaultStartTime: '18:00',
    defaultEndTime: '20:00',
    defaultDuration: 120,
    repeatable: false,
    category: 'social',
    component: 'FamilyTime',
  },
  {
    id: 'social',
    name: 'Social Time',
    description: 'Friends, calls, coffee catch-ups, community.',
    icon: 'MessageCircle',
    defaultStartTime: '19:00',
    defaultEndTime: '20:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'social',
    component: 'GenericBlock',
  },

  // ─── Life & Logistics ───────────────────────────────────────────────────────
  {
    id: 'commute',
    name: 'Commute',
    description: 'Travel time. Podcasts, audiobooks, or just decompress.',
    icon: 'Car',
    defaultStartTime: '08:00',
    defaultEndTime: '08:45',
    defaultDuration: 45,
    repeatable: true,
    category: 'routine',
    component: 'GenericBlock',
  },
  {
    id: 'chores',
    name: 'Chores',
    description: 'Cleaning, laundry, dishes, tidying — the daily maintenance.',
    icon: 'Home',
    defaultStartTime: '09:00',
    defaultEndTime: '10:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'routine',
    component: 'GenericBlock',
  },
  {
    id: 'errands',
    name: 'Errands',
    description: 'Groceries, appointments, returns, things outside the house.',
    icon: 'ShoppingCart',
    defaultStartTime: '10:00',
    defaultEndTime: '11:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'routine',
    component: 'GenericBlock',
  },
  {
    id: 'meal-prep',
    name: 'Meal Prep',
    description: 'Batch cooking, prep lunches, plan the week\'s food.',
    icon: 'ChefHat',
    defaultStartTime: '10:00',
    defaultEndTime: '11:30',
    defaultDuration: 90,
    repeatable: true,
    category: 'meals',
    component: 'GenericBlock',
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    description: 'Feed, walk, play, or vet appointments for your animals.',
    icon: 'Dog',
    defaultStartTime: '07:00',
    defaultEndTime: '07:30',
    defaultDuration: 30,
    repeatable: true,
    category: 'routine',
    component: 'GenericBlock',
  },

  // ─── Boundaries & Rest ──────────────────────────────────────────────────────
  {
    id: 'hard-stop',
    name: 'Hard Stop',
    description: 'A firm boundary — work ends, eating window closes, transition time.',
    icon: 'OctagonAlert',
    defaultStartTime: '18:00',
    defaultEndTime: '18:00',
    defaultDuration: 0, // marker, not a duration
    repeatable: true,
    category: 'rest',
    component: 'HardStop',
  },
  {
    id: 'break',
    name: 'Break',
    description: 'Step away. Walk, snack, stretch, reset your focus.',
    icon: 'Coffee',
    defaultStartTime: '12:00',
    defaultEndTime: '12:30',
    defaultDuration: 30,
    repeatable: true,
    category: 'rest',
    component: 'GenericBlock',
  },
  {
    id: 'nap',
    name: 'Power Nap',
    description: '20-minute nap to recharge energy and focus.',
    icon: 'Moon',
    defaultStartTime: '14:00',
    defaultEndTime: '14:20',
    defaultDuration: 20,
    repeatable: false,
    category: 'rest',
    component: 'GenericBlock',
  },
  {
    id: 'wind-down',
    name: 'Wind Down',
    description: 'Transition to evening — TV, games, music, low-key time.',
    icon: 'Film',
    defaultStartTime: '20:00',
    defaultEndTime: '21:30',
    defaultDuration: 90,
    repeatable: false,
    category: 'rest',
    component: 'GenericBlock',
  },

  // ─── Custom ─────────────────────────────────────────────────────────────────
  {
    id: 'custom',
    name: 'Custom Block',
    description: 'Build your own — notes field and a checklist you define.',
    icon: 'SquarePlus',
    defaultStartTime: '09:00',
    defaultEndTime: '10:00',
    defaultDuration: 60,
    repeatable: true,
    category: 'custom',
    component: 'GenericBlock',
  },
]

export function getBlockType(id: string): BlockType | undefined {
  // Check main registry first
  const found = BLOCK_REGISTRY.find((b) => b.id === id)
  if (found) return found
  // Backward compat for deprecated block IDs that may exist in saved configs
  return DEPRECATED_BLOCKS[id]
}

// Old block IDs that still need to render for existing users
const DEPRECATED_BLOCKS: Record<string, BlockType> = {
  'supplements-midday': {
    id: 'supplements-midday', name: 'Midday Supplements', description: 'Take your midday supplements.',
    icon: 'Pill', defaultStartTime: '12:00', defaultEndTime: '13:00', defaultDuration: 0,
    repeatable: false, category: 'health', component: 'SupplementsMidday',
  },
  'supplements-evening': {
    id: 'supplements-evening', name: 'Evening Supplements', description: 'Take your evening supplements.',
    icon: 'Pill', defaultStartTime: '19:00', defaultEndTime: '20:00', defaultDuration: 0,
    repeatable: false, category: 'health', component: 'SupplementsEvening',
  },
  'personal-work': {
    id: 'personal-work', name: 'Personal Work', description: 'Time for your own business or projects.',
    icon: 'Laptop', defaultStartTime: '08:30', defaultEndTime: '12:00', defaultDuration: 180,
    repeatable: true, category: 'work', component: 'WorkBlock',
  },
  'movie-night': {
    id: 'movie-night', name: 'Wind Down', description: 'Relax and wind down for the night.',
    icon: 'Film', defaultStartTime: '20:00', defaultEndTime: '22:00', defaultDuration: 90,
    repeatable: false, category: 'rest', component: 'MovieNight',
  },
  'skincare': {
    id: 'skincare', name: 'Skincare / Grooming', description: 'Morning or evening skincare routine.',
    icon: 'Sparkles', defaultStartTime: '07:00', defaultEndTime: '07:15', defaultDuration: 15,
    repeatable: true, category: 'routine', component: 'GenericBlock',
  },
  'date-night': {
    id: 'date-night', name: 'Date Night', description: 'Quality time with your partner.',
    icon: 'Heart', defaultStartTime: '19:00', defaultEndTime: '22:00', defaultDuration: 180,
    repeatable: false, category: 'social', component: 'GenericBlock',
  },
  'lunch-break': {
    id: 'lunch-break', name: 'Lunch Break', description: 'Step away from work — eat and recharge.',
    icon: 'Coffee', defaultStartTime: '12:00', defaultEndTime: '13:00', defaultDuration: 60,
    repeatable: false, category: 'meals', component: 'GenericBlock',
  },
}
