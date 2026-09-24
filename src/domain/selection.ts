import { ALL_FACTS, areConfusable, factKey, INTRODUCTION_ORDER, type Fact } from './facts'
import { factProgress, factState, type FactState, type Progress } from './progress'

export const COOLDOWN_CARDS = 5

const CONFUSION_WINDOW = 2
const WORKING_SET = 7
const MISS_BOOST = 3
const MISS_DECAY_CARDS = 20

type Picker = (facts: readonly Fact[], progress: Progress, random: () => number) => Fact

const missWeight = (progress: Progress, fact: Fact): number => {
  const lastMissedTick = factProgress(progress, fact)?.lastMissedTick
  if (!lastMissedTick) return 1
  const freshness = Math.max(0, 1 - (progress.tick - lastMissedTick) / MISS_DECAY_CARDS)
  return 1 + MISS_BOOST * freshness
}

const pickWeighted: Picker = (facts, progress, random) => {
  const weights = facts.map((fact) => missWeight(progress, fact))
  let remaining = random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (const [index, weight] of weights.entries()) {
    remaining -= weight
    if (remaining <= 0) return facts[index]
  }
  return facts[facts.length - 1]
}

const pickLeastRecentlySeen: Picker = (facts, progress) =>
  facts.reduce((oldest, fact) =>
    (factProgress(progress, fact)?.lastSeenTick ?? 0) <
    (factProgress(progress, oldest)?.lastSeenTick ?? 0)
      ? fact
      : oldest,
  )

const inState = (progress: Progress, state: FactState): readonly Fact[] =>
  INTRODUCTION_ORDER.filter((fact) => factState(progress, fact) === state)

export const workingSet = (progress: Progress): readonly Fact[] =>
  [...inState(progress, 'learning'), ...inState(progress, 'untouched')].slice(0, WORKING_SET)

const withoutRecent = (facts: readonly Fact[], recent: readonly Fact[]): readonly Fact[] =>
  facts.filter((fact) => !recent.some((seen) => factKey(seen) === factKey(fact)))

const unconfused = (facts: readonly Fact[], recent: readonly Fact[]): readonly Fact[] => {
  const confusing = recent.slice(0, CONFUSION_WINDOW)
  return facts.filter((fact) => !confusing.some((seen) => areConfusable(seen, fact)))
}

export const pickFact = (
  progress: Progress,
  recent: readonly Fact[],
  random: () => number = Math.random,
): Fact => {
  const pool = workingSet(progress)
  if (pool.length > 0) {
    const window = recent.slice(0, Math.min(COOLDOWN_CARDS, pool.length - 1))
    const rested = withoutRecent(pool, window)
    const candidates = unconfused(rested, window)
    return pickWeighted(candidates.length > 0 ? candidates : rested, progress, random)
  }

  const rested = withoutRecent(ALL_FACTS, recent)
  return pickLeastRecentlySeen(rested.length > 0 ? rested : ALL_FACTS, progress, random)
}
