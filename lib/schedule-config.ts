'use client'

// A configured block instance in the user's schedule
export type ScheduleBlock = {
  instanceId: string          // unique instance ID (allows multiple of same type)
  blockTypeId: string         // references BlockType.id
  label: string               // custom label (e.g. "Morning Work", "Afternoon Work")
  startTime: string           // HH:MM
  endTime: string             // HH:MM
  subtitle?: string           // custom subtitle
  days?: 'all' | 'weekdays' | 'weekends' | number[]  // which days this shows
}

export type ScheduleConfig = {
  weekday: ScheduleBlock[]
  weekend: ScheduleBlock[]
}

const STORAGE_KEY = 'schedule-config'

const DEFAULT_WEEKDAY: ScheduleBlock[] = [
  { instanceId: 'wd-1', blockTypeId: 'morning-routine', label: 'Morning Routine', startTime: '06:30', endTime: '08:30', subtitle: 'Ease into the day and set your focus.' },
  { instanceId: 'wd-2', blockTypeId: 'meals', label: 'Meals', startTime: '10:00', endTime: '18:00', subtitle: 'Eating window. Log breakfast, lunch, and supper.' },
  { instanceId: 'wd-3', blockTypeId: 'water', label: 'Water', startTime: '06:30', endTime: '21:00', subtitle: 'Stay hydrated — 8 glasses.' },
  { instanceId: 'wd-4', blockTypeId: 'personal-work', label: 'Morning Work Block', startTime: '08:30', endTime: '12:00', subtitle: 'Personal business — build your own thing.' },
  { instanceId: 'wd-5', blockTypeId: 'fitness', label: 'Fitness', startTime: '12:00', endTime: '13:00', subtitle: '20-min dumbbell routine and recovery.' },
  { instanceId: 'wd-6', blockTypeId: 'supplements-midday', label: 'Midday Supplements', startTime: '12:00', endTime: '13:00', subtitle: 'Take your midday supplements.' },
  { instanceId: 'wd-7', blockTypeId: 'work', label: 'Afternoon Work Block', startTime: '13:00', endTime: '17:00', subtitle: 'Day job — finish strong.' },
  { instanceId: 'wd-8', blockTypeId: 'hard-stop', label: 'Hard Stop', startTime: '18:00', endTime: '18:00', subtitle: 'Work stops. Eating window closes.' },
  { instanceId: 'wd-9', blockTypeId: 'family-time', label: 'Family Time', startTime: '18:00', endTime: '20:00', subtitle: 'Be present. Log what you did together.' },
  { instanceId: 'wd-10', blockTypeId: 'supplements-evening', label: 'Evening Supplements', startTime: '19:00', endTime: '20:00', subtitle: 'Take your evening supplements.' },
  { instanceId: 'wd-11', blockTypeId: 'walk', label: 'Daily Walk', startTime: '18:00', endTime: '21:00', subtitle: '30–60 min. With family or solo.' },
  { instanceId: 'wd-12', blockTypeId: 'personal-work', label: 'Evening Work Block', startTime: '20:00', endTime: '21:00', subtitle: 'Personal business — one focused hour.' },
]

const DEFAULT_WEEKEND: ScheduleBlock[] = [
  { instanceId: 'we-1', blockTypeId: 'morning-routine', label: 'Morning Routine', startTime: '06:30', endTime: '07:00', subtitle: 'Easy start — coffee and set intentions.' },
  { instanceId: 'we-2', blockTypeId: 'meals', label: 'Meals', startTime: '10:00', endTime: '18:00', subtitle: 'Eating window. Log breakfast, lunch, and supper.' },
  { instanceId: 'we-3', blockTypeId: 'water', label: 'Water', startTime: '06:30', endTime: '21:00', subtitle: 'Stay hydrated — 8 glasses.' },
  { instanceId: 'we-4', blockTypeId: 'personal-work', label: 'Personal Work Block', startTime: '06:30', endTime: '10:30', subtitle: '4 hours of deep work on your business.' },
  { instanceId: 'we-5', blockTypeId: 'family-time', label: 'Family Time', startTime: '12:00', endTime: '20:00', subtitle: 'Full afternoon with the family.' },
  { instanceId: 'we-6', blockTypeId: 'hard-stop', label: 'Eating Window Closes', startTime: '18:00', endTime: '18:00', subtitle: 'No more food — fasting until 10 AM tomorrow.' },
  { instanceId: 'we-7', blockTypeId: 'walk', label: 'Daily Walk', startTime: '18:00', endTime: '20:00', subtitle: '30–60 min. With family or solo.' },
  { instanceId: 'we-8', blockTypeId: 'movie-night', label: 'Movie Night', startTime: '20:00', endTime: '22:00', subtitle: 'Wind down together.' },
]

export function getScheduleConfig(): ScheduleConfig {
  if (typeof window === 'undefined') return { weekday: DEFAULT_WEEKDAY, weekend: DEFAULT_WEEKEND }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { weekday: DEFAULT_WEEKDAY, weekend: DEFAULT_WEEKEND }
}

export function setScheduleConfig(config: ScheduleConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {}
}

export function hasScheduleConfig(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== null
}

export { DEFAULT_WEEKDAY, DEFAULT_WEEKEND }
