import { ALL_FACTS, areConfusable, factKey, INTRODUCTION_ORDER, type Fact } from './facts'
import { factProgress, factState, isDueForReview, today, type Progress } from './progress'

export const COOLDOWN_CARDS = 5

const CONFUSION_WINDOW = 2
const WORKING_SET = 7
const REVIEW_SHARE = 0.2
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

const workingSet = (progress: Progress): readonly Fact[] => {
  const started = ALL_FACTS.filter((fact) => factState(progress, fact) === 'learning')
  const slots = Math.max(0, WORKING_SET - started.length)
  const newcomers = INTRODUCTION_ORDER.filter(
    (fact) => factState(progress, fact) === 'untouched',
  ).slice(0, slots)
  return [...started, ...newcomers]
}

const withoutRecent = (facts: readonly Fact[], recent: readonly Fact[]): readonly Fact[] =>
  facts.filter((fact) => !recent.some((seen) => factKey(seen) === factKey(fact)))

const choose = (
  facts: readonly Fact[],
  recent: readonly Fact[],
  progress: Progress,
  pick: Picker,
  random: () => number,
): Fact | undefined => {
  const unseen = withoutRecent(facts, recent)
  const confusing = recent.slice(0, CONFUSION_WINDOW)
  const distinct = unseen.filter((fact) => !confusing.some((seen) => areConfusable(seen, fact)))

  for (const pool of [distinct, unseen, facts]) {
    if (pool.length > 0) return pick(pool, progress, random)
  }
  return undefined
}

export const pickFact = (
  progress: Progress,
  recent: readonly Fact[],
  random: () => number = Math.random,
): Fact => {
  const day = today()
  const review = {
    facts: ALL_FACTS.filter((fact) => isDueForReview(progress, fact, day)),
    pick: pickLeastRecentlySeen,
  }
  const drill = { facts: workingSet(progress), pick: pickWeighted }
  const reviewFirst = drill.facts.length === 0 || random() < REVIEW_SHARE

  for (const pool of reviewFirst ? [review, drill] : [drill, review]) {
    const chosen = choose(pool.facts, recent, progress, pool.pick, random)
    if (chosen) return chosen
  }
  const rested = withoutRecent(ALL_FACTS, recent)
  return pickLeastRecentlySeen(rested.length > 0 ? rested : ALL_FACTS, progress, random)
}
