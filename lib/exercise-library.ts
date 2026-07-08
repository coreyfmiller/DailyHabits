'use client'

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio'

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell' | 'band'

export type LibraryExercise = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  defaultSets: string
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  cardio: 'Cardio',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  cable: 'Cable',
  kettlebell: 'Kettlebell',
  band: 'Band',
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Chest
  { id: 'lib-bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', defaultSets: '4×8' },
  { id: 'lib-db-bench', name: 'Dumbbell Bench Press', muscleGroup: 'chest', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-incline-bench', name: 'Incline Bench Press', muscleGroup: 'chest', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-incline-db', name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-chest-fly', name: 'Cable Chest Fly', muscleGroup: 'chest', equipment: 'cable', defaultSets: '3×12' },
  { id: 'lib-db-fly', name: 'Dumbbell Fly', muscleGroup: 'chest', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-pushup', name: 'Push-ups', muscleGroup: 'chest', equipment: 'bodyweight', defaultSets: '3×15' },
  { id: 'lib-dips', name: 'Dips', muscleGroup: 'chest', equipment: 'bodyweight', defaultSets: '3×12' },
  { id: 'lib-chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'chest', equipment: 'machine', defaultSets: '3×12' },
  { id: 'lib-pec-deck', name: 'Pec Deck', muscleGroup: 'chest', equipment: 'machine', defaultSets: '3×12' },

  // Back
  { id: 'lib-deadlift', name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell', defaultSets: '4×5' },
  { id: 'lib-barbell-row', name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell', defaultSets: '4×8' },
  { id: 'lib-db-row', name: 'Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-pullup', name: 'Pull-ups', muscleGroup: 'back', equipment: 'bodyweight', defaultSets: '3×8' },
  { id: 'lib-lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable', defaultSets: '3×10' },
  { id: 'lib-seated-row', name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable', defaultSets: '3×10' },
  { id: 'lib-t-bar-row', name: 'T-Bar Row', muscleGroup: 'back', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-face-pull', name: 'Face Pulls', muscleGroup: 'back', equipment: 'cable', defaultSets: '3×15' },
  { id: 'lib-reverse-fly', name: 'Reverse Fly', muscleGroup: 'back', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-hyperextension', name: 'Hyperextensions', muscleGroup: 'back', equipment: 'bodyweight', defaultSets: '3×12' },

  // Shoulders
  { id: 'lib-ohp', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell', defaultSets: '4×8' },
  { id: 'lib-db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-lateral-raise', name: 'Lateral Raises', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×15' },
  { id: 'lib-front-raise', name: 'Front Raises', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-upright-row', name: 'Upright Row', muscleGroup: 'shoulders', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-cable-lateral', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', equipment: 'cable', defaultSets: '3×12' },
  { id: 'lib-rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×15' },
  { id: 'lib-shrugs', name: 'Barbell Shrugs', muscleGroup: 'shoulders', equipment: 'barbell', defaultSets: '3×12' },
  { id: 'lib-db-shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'shoulders', equipment: 'dumbbell', defaultSets: '3×15' },

  // Arms
  { id: 'lib-barbell-curl', name: 'Barbell Curl', muscleGroup: 'arms', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-db-curl', name: 'Dumbbell Curl', muscleGroup: 'arms', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-hammer-curl', name: 'Hammer Curls', muscleGroup: 'arms', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-preacher-curl', name: 'Preacher Curl', muscleGroup: 'arms', equipment: 'machine', defaultSets: '3×10' },
  { id: 'lib-cable-curl', name: 'Cable Curl', muscleGroup: 'arms', equipment: 'cable', defaultSets: '3×12' },
  { id: 'lib-tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'arms', equipment: 'cable', defaultSets: '3×12' },
  { id: 'lib-skull-crusher', name: 'Skull Crushers', muscleGroup: 'arms', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-overhead-ext', name: 'Overhead Tricep Extension', muscleGroup: 'arms', equipment: 'dumbbell', defaultSets: '3×10' },
  { id: 'lib-tricep-dip', name: 'Tricep Dips', muscleGroup: 'arms', equipment: 'bodyweight', defaultSets: '3×12' },
  { id: 'lib-concentration-curl', name: 'Concentration Curl', muscleGroup: 'arms', equipment: 'dumbbell', defaultSets: '3×10' },

  // Legs
  { id: 'lib-squat', name: 'Barbell Squat', muscleGroup: 'legs', equipment: 'barbell', defaultSets: '4×8' },
  { id: 'lib-goblet-squat', name: 'Goblet Squat', muscleGroup: 'legs', equipment: 'dumbbell', defaultSets: '3×12' },
  { id: 'lib-leg-press', name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine', defaultSets: '4×10' },
  { id: 'lib-rdl', name: 'Romanian Deadlift', muscleGroup: 'legs', equipment: 'barbell', defaultSets: '3×10' },
  { id: 'lib-lunges', name: 'Walking Lunges', muscleGroup: 'legs', equipment: 'dumbbell', defaultSets: '3×10 each' },
  { id: 'lib-leg-curl', name: 'Leg Curl', muscleGroup: 'legs', equipment: 'machine', defaultSets: '3×12' },
  { id: 'lib-leg-ext', name: 'Leg Extension', muscleGroup: 'legs', equipment: 'machine', defaultSets: '3×12' },
  { id: 'lib-calf-raise', name: 'Calf Raises', muscleGroup: 'legs', equipment: 'machine', defaultSets: '4×15' },
  { id: 'lib-bulgarian-split', name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell', defaultSets: '3×10 each' },
  { id: 'lib-hip-thrust', name: 'Hip Thrust', muscleGroup: 'legs', equipment: 'barbell', defaultSets: '3×12' },

  // Core
  { id: 'lib-plank', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×60 sec' },
  { id: 'lib-crunches', name: 'Crunches', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×20' },
  { id: 'lib-hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×12' },
  { id: 'lib-russian-twist', name: 'Russian Twists', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×20' },
  { id: 'lib-bicycle-crunch', name: 'Bicycle Crunches', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×20' },
  { id: 'lib-ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×10' },
  { id: 'lib-cable-woodchop', name: 'Cable Woodchop', muscleGroup: 'core', equipment: 'cable', defaultSets: '3×12' },
  { id: 'lib-dead-bug', name: 'Dead Bug', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×10 each' },
  { id: 'lib-mountain-climber', name: 'Mountain Climbers', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×30 sec' },
  { id: 'lib-side-plank', name: 'Side Plank', muscleGroup: 'core', equipment: 'bodyweight', defaultSets: '3×30 sec each' },

  // Cardio
  { id: 'lib-running', name: 'Running', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '20 min' },
  { id: 'lib-cycling', name: 'Cycling', muscleGroup: 'cardio', equipment: 'machine', defaultSets: '30 min' },
  { id: 'lib-rowing', name: 'Rowing Machine', muscleGroup: 'cardio', equipment: 'machine', defaultSets: '15 min' },
  { id: 'lib-jump-rope', name: 'Jump Rope', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '3×3 min' },
  { id: 'lib-burpees', name: 'Burpees', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '3×15' },
  { id: 'lib-box-jump', name: 'Box Jumps', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '3×10' },
  { id: 'lib-stairclimber', name: 'Stair Climber', muscleGroup: 'cardio', equipment: 'machine', defaultSets: '15 min' },
  { id: 'lib-battle-ropes', name: 'Battle Ropes', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '3×30 sec' },
  { id: 'lib-kettlebell-swing', name: 'Kettlebell Swings', muscleGroup: 'cardio', equipment: 'kettlebell', defaultSets: '3×15' },
  { id: 'lib-sprints', name: 'Sprint Intervals', muscleGroup: 'cardio', equipment: 'bodyweight', defaultSets: '8×30 sec' },
]

export function getExercisesByMuscleGroup(group: MuscleGroup): LibraryExercise[] {
  return EXERCISE_LIBRARY.filter((e) => e.muscleGroup === group)
}

export function searchExercises(query: string): LibraryExercise[] {
  const lower = query.toLowerCase().trim()
  if (!lower) return EXERCISE_LIBRARY
  return EXERCISE_LIBRARY.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.muscleGroup.includes(lower) ||
      e.equipment.includes(lower)
  )
}
