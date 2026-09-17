import { ALL_FACTS, factKey, type Fact } from './facts'

export const LEARNED_STREAK = 3

export interface FactProgress {
  readonly streak: number
  readonly lastSeenTick: number
  readonly lastMissedTick: number | null
}

export interface Progress {
  readonly tick: number
  readonly facts: Readonly<Record<string, FactProgress>>
  readonly celebrated: boolean
}

export type FactState = 'untouched' | 'learning' | 'learned'

export const emptyProgress = (): Progress => ({ tick: 0, facts: {}, celebrated: false })

export const factProgress = (progress: Progress, fact: Fact): FactProgress | undefined =>
  progress.facts[factKey(fact)]

export const factState = (progress: Progress, fact: Fact): FactState => {
  const entry = factProgress(progress, fact)
  if (!entry) return 'untouched'
  return entry.streak >= LEARNED_STREAK ? 'learned' : 'learning'
}

export const isLearned = (progress: Progress, fact: Fact): boolean =>
  factState(progress, fact) === 'learned'

export const factStreak = (progress: Progress, fact: Fact): number =>
  Math.min(factProgress(progress, fact)?.streak ?? 0, LEARNED_STREAK)

export const learnedCount = (progress: Progress): number =>
  ALL_FACTS.filter((fact) => isLearned(progress, fact)).length

export const recordAnswer = (progress: Progress, fact: Fact, knew: boolean): Progress => {
  const tick = progress.tick + 1
  const key = factKey(fact)
  const previous = progress.facts[key]
  return {
    ...progress,
    tick,
    facts: {
      ...progress.facts,
      [key]: {
        streak: knew ? (previous?.streak ?? 0) + 1 : 0,
        lastSeenTick: tick,
        lastMissedTick: knew ? (previous?.lastMissedTick ?? null) : tick,
      },
    },
  }
}

export const forgetFact = (progress: Progress, fact: Fact): Progress => {
  const { [factKey(fact)]: _removed, ...rest } = progress.facts
  return { ...progress, facts: rest, celebrated: false }
}

export const withCelebrated = (progress: Progress): Progress => ({ ...progress, celebrated: true })
