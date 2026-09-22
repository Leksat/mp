import { ALL_FACTS, areConfusable, factKey, INTRODUCTION_ORDER, type Fact } from './facts'
import { factProgress, factState, isDueForReview, today, type Progress } from './progress'

export const COOLDOWN_CARDS = 5

const CONFUSION_WINDOW = 2
const WORKING_SET = 7
const REVIEW_SHARE = 0.2
const EARLY_REVIEW_SHARE = 0.25
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

const dueDayOf = (progress: Progress, fact: Fact): number =>
  factProgress(progress, fact)?.dueDay ?? Infinity

const pickSoonestDue: Picker = (facts, progress, random) => {
  const bySoonest = [...facts].sort((one, other) => dueDayOf(progress, one) - dueDayOf(progress, other))
  const head = bySoonest.slice(0, Math.max(1, Math.ceil(bySoonest.length * EARLY_REVIEW_SHARE)))
  return pickLeastRecentlySeen(head, progress, random)
}

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

const unconfused = (facts: readonly Fact[], recent: readonly Fact[]): readonly Fact[] => {
  const confusing = recent.slice(0, CONFUSION_WINDOW)
  return facts.filter((fact) => !confusing.some((seen) => areConfusable(seen, fact)))
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
  const pools = (reviewFirst ? [review, drill] : [drill, review]).map((pool) => ({
    ...pool,
    facts: withoutRecent(pool.facts, recent),
  }))

  for (const relax of [unconfused, (facts: readonly Fact[]) => facts]) {
    for (const pool of pools) {
      const candidates = relax(pool.facts, recent)
      if (candidates.length > 0) return pool.pick(candidates, progress, random)
    }
  }

  const rested = withoutRecent(ALL_FACTS, recent)
  return pickSoonestDue(rested.length > 0 ? rested : ALL_FACTS, progress, random)
}
