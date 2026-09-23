import { ALL_FACTS, FACTORS, baseRequiredStreak, factKey } from './domain/facts'
import type { FactProgress, Progress } from './domain/progress'
import { saveProgress } from './domain/storage'

const SEED_FLAG = 'seed'
const RAMP_STEPS = FACTORS.length - 2

const rampedProgress = (): Progress => {
  const facts: Record<string, FactProgress> = {}
  ALL_FACTS.forEach((fact) => {
    const step = FACTORS.indexOf(fact.right) - 1
    if (step < 0) return
    const streak = Math.round((step / RAMP_STEPS) * baseRequiredStreak(fact))
    facts[factKey(fact)] = { streak, lastSeenTick: step, lastMissedTick: null }
  })
  return { tick: ALL_FACTS.length, facts, celebrated: false }
}

export const seedProgressFromUrl = (): void => {
  if (!import.meta.env.DEV) return
  if (!new URLSearchParams(location.search).has(SEED_FLAG)) return
  saveProgress(rampedProgress())
}
