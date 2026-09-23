import { ALL_FACTS, FACTORS, baseRequiredStreak, factKey } from './domain/facts'
import type { FactProgress, Progress } from './domain/progress'
import { saveProgress } from './domain/storage'

const SEED_FLAG = 'seed'

const rampedProgress = (): Progress => {
  const facts: Record<string, FactProgress> = {}
  ALL_FACTS.forEach((fact) => {
    const column = FACTORS.indexOf(fact.right)
    const appearances = baseRequiredStreak(fact) + 2
    const bucket = Math.floor(((column + 0.5) * appearances) / FACTORS.length)
    if (bucket === 0) return
    facts[factKey(fact)] = { streak: bucket - 1, lastSeenTick: column, lastMissedTick: null }
  })
  return { tick: ALL_FACTS.length, facts, celebrated: false }
}

export const seedProgressFromUrl = (): void => {
  if (!import.meta.env.DEV) return
  if (!new URLSearchParams(location.search).has(SEED_FLAG)) return
  saveProgress(rampedProgress())
}
