'use client'

export type FastingProtocol = 'none' | '16:8' | '18:6' | '20:4' | 'custom'

export type DietType = 'none' | 'keto' | 'low-carb' | 'high-protein' | 'plant-based' | 'mediterranean'

export type NutritionConfig = {
  fasting: FastingProtocol
  fastingWindowStart: string  // HH:MM — when eating window opens
  fastingWindowEnd: string    // HH:MM — when eating window closes
  calorieTarget: number       // 0 means no target
  dietType: DietType
}

const STORAGE_KEY = 'nutrition-config'

const PROTOCOL_WINDOWS: Record<Exclude<FastingProtocol, 'none' | 'custom'>, { start: string; end: string }> = {
  '16:8': { start: '10:00', end: '18:00' },
  '18:6': { start: '11:00', end: '17:00' },
  '20:4': { start: '12:00', end: '16:00' },
}

export const FASTING_LABELS: Record<FastingProtocol, string> = {
  none: 'No fasting',
  '16:8': '16:8 (8-hour window)',
  '18:6': '18:6 (6-hour window)',
  '20:4': '20:4 (4-hour window)',
  custom: 'Custom window',
}

export const DIET_LABELS: Record<DietType, string> = {
  none: 'No specific diet',
  keto: 'Keto',
  'low-carb': 'Low Carb',
  'high-protein': 'High Protein',
  'plant-based': 'Plant-Based',
  mediterranean: 'Mediterranean',
}

const DEFAULT_CONFIG: NutritionConfig = {
  fasting: 'none',
  fastingWindowStart: '10:00',
  fastingWindowEnd: '18:00',
  calorieTarget: 0,
  dietType: 'none',
}

export function getNutritionConfig(): NutritionConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_CONFIG
}

export function setNutritionConfig(config: NutritionConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {}
}

export function getWindowForProtocol(protocol: FastingProtocol): { start: string; end: string } | null {
  if (protocol === 'none') return null
  if (protocol === 'custom') return null // caller uses custom values
  return PROTOCOL_WINDOWS[protocol] ?? null
}

export function isInEatingWindow(config: NutritionConfig): boolean {
  if (config.fasting === 'none') return true
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = config.fastingWindowStart.split(':').map(Number)
  const [endH, endM] = config.fastingWindowEnd.split(':').map(Number)
  const startMin = startH * 60 + startM
  const endMin = endH * 60 + endM
  return minutes >= startMin && minutes < endMin
}

export function timeUntilWindow(config: NutritionConfig): string {
  if (config.fasting === 'none') return ''
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = config.fastingWindowStart.split(':').map(Number)
  const startMin = startH * 60 + startM

  let diff = startMin - minutes
  if (diff <= 0) diff += 24 * 60 // next day

  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`
}
