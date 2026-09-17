import { ALL_FACTS, factKey, type Fact } from './facts'
import { factProgress, isLearned, type Progress } from './progress'

export const COOLDOWN_CARDS = 5

const REVIEW_SHARE = 0.2
const MISS_BOOST = 3
const MISS_DECAY_CARDS = 20

const missWeight = (progress: Progress, fact: Fact): number => {
  const lastMissedTick = factProgress(progress, fact)?.lastMissedTick
  if (!lastMissedTick) return 1
  const freshness = Math.max(0, 1 - (progress.tick - lastMissedTick) / MISS_DECAY_CARDS)
  return 1 + MISS_BOOST * freshness
}

const pickWeighted = (facts: readonly Fact[], progress: Progress, random: () => number): Fact => {
  const weights = facts.map((fact) => missWeight(progress, fact))
  let remaining = random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (const [index, weight] of weights.entries()) {
    remaining -= weight
    if (remaining <= 0) return facts[index]
  }
  return facts[facts.length - 1]
}

const leastRecentlySeen = (facts: readonly Fact[], progress: Progress): Fact =>
  facts.reduce((oldest, fact) =>
    (factProgress(progress, fact)?.lastSeenTick ?? 0) < (factProgress(progress, oldest)?.lastSeenTick ?? 0)
      ? fact
      : oldest,
  )

export const pickFact = (
  progress: Progress,
  recentKeys: readonly string[],
  random: () => number = Math.random,
): Fact => {
  const eligible = ALL_FACTS.filter((fact) => !recentKeys.includes(factKey(fact)))
  const pool = eligible.length > 0 ? eligible : ALL_FACTS
  const unlearned = pool.filter((fact) => !isLearned(progress, fact))
  const learned = pool.filter((fact) => isLearned(progress, fact))

  if (unlearned.length === 0) return leastRecentlySeen(learned, progress)
  if (learned.length > 0 && random() < REVIEW_SHARE) return leastRecentlySeen(learned, progress)
  return pickWeighted(unlearned, progress, random)
}
