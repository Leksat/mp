import { FACTORS, baseRequiredStreak, factKey, toFact } from './domain/facts'
import type { FactProgress, Progress } from './domain/progress'
import { saveProgress } from './domain/storage'

const SEED_FLAG = 'seed'
const RAMP_STEPS = FACTORS.length - 2

export const rampedProgress = (): Progress => {
  const facts: Record<string, FactProgress> = {}

  FACTORS.forEach((left) => {
    let reached = 0

    FACTORS.forEach((right, column) => {
      const step = column - 1
      if (step < 0) return

      const fact = toFact(left, right)
      const required = baseRequiredStreak(fact)
      const nearest = Math.round((step / RAMP_STEPS) * required)
      const streak = Math.max(nearest, Math.ceil(reached * required))

      reached = streak / required
      facts[factKey(fact)] = { streak, lastSeenTick: step, lastMissedTick: null }
    })
  })

  return { tick: FACTORS.length * FACTORS.length, facts, celebrated: false }
}

export const seedProgressFromUrl = (): void => {
  if (!import.meta.env.DEV) return
  if (!new URLSearchParams(location.search).has(SEED_FLAG)) return
  saveProgress(rampedProgress())
}
