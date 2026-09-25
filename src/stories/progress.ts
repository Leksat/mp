import { ALL_FACTS, INTRODUCTION_ORDER, baseRequiredStreak, factKey, toFact, type Fact } from '../domain/facts'
import type { Progress } from '../domain/progress'
import { previewFacts } from '../domain/selection'

export { rampedProgress } from '../devSeed'

interface FactStreak {
  readonly fact: Fact
  readonly streak: number
}

const progressWithStreaks = (streaks: readonly FactStreak[], celebrated: boolean): Progress => ({
  tick: streaks.length,
  facts: Object.fromEntries(
    streaks.map(({ fact, streak }) => [
      factKey(fact),
      { streak, lastSeenTick: 0, lastMissedTick: null },
    ]),
  ),
  celebrated,
})

const learned = (facts: readonly Fact[]): readonly FactStreak[] =>
  facts.map((fact) => ({ fact, streak: baseRequiredStreak(fact) }))

const LEARNED_MIDWAY = 40
const IN_PROGRESS = 7

export const midwayProgress: Progress = progressWithStreaks(
  [
    ...learned(INTRODUCTION_ORDER.slice(0, LEARNED_MIDWAY)),
    ...INTRODUCTION_ORDER.slice(LEARNED_MIDWAY, LEARNED_MIDWAY + IN_PROGRESS).map((fact, index) => ({
      fact,
      streak: index % baseRequiredStreak(fact),
    })),
  ],
  false,
)

export const LAST_FACT = toFact(7, 8)

export const oneFactLeftProgress: Progress = progressWithStreaks(
  [
    ...learned(ALL_FACTS.filter((fact) => factKey(fact) !== factKey(LAST_FACT))),
    { fact: LAST_FACT, streak: baseRequiredStreak(LAST_FACT) - 1 },
  ],
  false,
)

export const completeProgress: Progress = progressWithStreaks(learned(ALL_FACTS), true)

export const inProgressFacts: readonly Fact[] = previewFacts(midwayProgress)
