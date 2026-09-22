import { ALL_FACTS, baseRequiredStreak, factKey, isTie, parseFactKey, twin, type Fact } from './facts'

const MAX_REQUIRED_STREAK = 8
const MISSES_PER_EXTRA_REP = 3
const MISS_PENALTY_SHARE = 3
const TWIN_CREDIT = 0.5
const TONES = 3

export interface FactProgress {
  readonly streak: number
  readonly misses: number
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

const requiredFor = (fact: Fact, misses: number): number => {
  const base = baseRequiredStreak(fact)
  return Math.min(base + Math.floor((base * misses) / MISSES_PER_EXTRA_REP), MAX_REQUIRED_STREAK)
}

const missPenalty = (required: number): number =>
  Math.max(1, Math.round(required / MISS_PENALTY_SHARE))

export const requiredStreak = (progress: Progress, fact: Fact): number =>
  requiredFor(fact, factProgress(progress, fact)?.misses ?? 0)

export const factState = (progress: Progress, fact: Fact): FactState => {
  const entry = factProgress(progress, fact)
  if (!entry) return 'untouched'
  return entry.streak >= requiredFor(fact, entry.misses) ? 'learned' : 'learning'
}

export const isLearned = (progress: Progress, fact: Fact): boolean =>
  factState(progress, fact) === 'learned'

export const factStreak = (progress: Progress, fact: Fact): number =>
  Math.min(factProgress(progress, fact)?.streak ?? 0, requiredStreak(progress, fact))

export const factTone = (progress: Progress, fact: Fact): number => {
  const state = factState(progress, fact)
  if (state === 'learned') return TONES
  const ratio = factStreak(progress, fact) / requiredStreak(progress, fact)
  return Math.min(TONES - 1, Math.floor(ratio * TONES))
}

export const learnedCount = (progress: Progress): number =>
  ALL_FACTS.filter((fact) => isLearned(progress, fact)).length

const SCORE_TOTAL = ALL_FACTS.reduce((total, fact) => total + baseRequiredStreak(fact), 0)

export const learnedPercent = (progress: Progress): number => {
  const earned = ALL_FACTS.reduce(
    (total, fact) =>
      total + Math.min(factProgress(progress, fact)?.streak ?? 0, baseRequiredStreak(fact)),
    0,
  )
  return Math.floor((earned / SCORE_TOTAL) * 100)
}

const answered = (
  previous: FactProgress | undefined,
  fact: Fact,
  knew: boolean,
  tick: number,
): FactProgress => {
  const misses = (previous?.misses ?? 0) + (knew ? 0 : 1)
  const required = requiredFor(fact, misses)
  const streakBefore = previous?.streak ?? 0
  return {
    streak: knew
      ? Math.min(streakBefore + 1, required)
      : Math.max(0, streakBefore - missPenalty(required)),
    misses,
    lastSeenTick: tick,
    lastMissedTick: knew ? (previous?.lastMissedTick ?? null) : tick,
  }
}

const credited = (previous: FactProgress, fact: Fact): FactProgress => ({
  ...previous,
  streak: Math.min(previous.streak + TWIN_CREDIT, requiredFor(fact, previous.misses)),
})

export const recordAnswer = (progress: Progress, fact: Fact, knew: boolean): Progress => {
  const tick = progress.tick + 1
  const facts = { ...progress.facts }
  facts[factKey(fact)] = answered(progress.facts[factKey(fact)], fact, knew, tick)

  const partner = twin(fact)
  const partnerEntry = progress.facts[factKey(partner)]
  if (knew && !isTie(fact) && partnerEntry && !isLearned(progress, partner)) {
    facts[factKey(partner)] = credited(partnerEntry, partner)
  }

  return { ...progress, tick, facts }
}

export const forgetFact = (progress: Progress, fact: Fact): Progress => {
  const { [factKey(fact)]: _removed, ...rest } = progress.facts
  return { ...progress, facts: rest, celebrated: false }
}

export const withCelebrated = (progress: Progress): Progress => ({ ...progress, celebrated: true })

interface LegacyFactProgress {
  readonly streak?: number
  readonly lastSeenTick?: number
  readonly lastMissedTick?: number | null
}

export interface LegacyProgress {
  readonly tick?: number
  readonly facts?: Readonly<Record<string, LegacyFactProgress>>
  readonly celebrated?: boolean
}

const LEGACY_LEARNED_STREAK = 3

export const fromLegacy = (legacy: LegacyProgress): Progress => {
  const facts: Record<string, FactProgress> = {}

  for (const [key, entry] of Object.entries(legacy.facts ?? {})) {
    const fact = parseFactKey(key)
    if (!fact) continue

    const required = requiredFor(fact, 0)
    const streak = (entry.streak ?? 0) >= LEGACY_LEARNED_STREAK ? required : (entry.streak ?? 0)
    facts[key] = {
      streak: Math.min(streak, required),
      misses: 0,
      lastSeenTick: entry.lastSeenTick ?? 0,
      lastMissedTick: entry.lastMissedTick ?? null,
    }
  }

  return { tick: legacy.tick ?? 0, facts, celebrated: legacy.celebrated ?? false }
}
