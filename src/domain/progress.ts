import { ALL_FACTS, baseRequiredStreak, factKey, isTie, parseFactKey, twin, type Fact } from './facts'

const MAX_REQUIRED_STREAK = 8
const MISSES_PER_EXTRA_REP = 3
const MISS_PENALTY_SHARE = 3
const SLOW_CREDIT = 0.5
const TWIN_CREDIT = 0.5
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 16, 35]
const LAST_BOX = REVIEW_INTERVAL_DAYS.length - 1
const TONES = 3
const DAY_MS = 24 * 60 * 60 * 1000

export const today = (): number => Math.floor(Date.now() / DAY_MS)

export interface FactProgress {
  readonly streak: number
  readonly misses: number
  readonly lastSeenTick: number
  readonly lastMissedTick: number | null
  readonly box: number
  readonly dueDay: number | null
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

export const isDueForReview = (progress: Progress, fact: Fact, day: number): boolean => {
  const entry = factProgress(progress, fact)
  return entry?.dueDay != null && entry.dueDay <= day && isLearned(progress, fact)
}

const scheduled = (entry: FactProgress, fact: Fact, day: number): FactProgress => {
  if (entry.streak < requiredFor(fact, entry.misses)) return { ...entry, box: 0, dueDay: null }
  return { ...entry, dueDay: day + REVIEW_INTERVAL_DAYS[entry.box] }
}

const answered = (
  previous: FactProgress | undefined,
  fact: Fact,
  knew: boolean,
  fluent: boolean,
  tick: number,
  day: number,
): FactProgress => {
  const misses = (previous?.misses ?? 0) + (knew ? 0 : 1)
  const required = requiredFor(fact, misses)
  const streakBefore = previous?.streak ?? 0
  const wasLearned = streakBefore >= requiredFor(fact, previous?.misses ?? 0)
  const boxBefore = previous?.box ?? 0
  const entry: FactProgress = {
    streak: knew
      ? Math.min(streakBefore + (fluent ? 1 : SLOW_CREDIT), required)
      : Math.max(0, streakBefore - missPenalty(required)),
    misses,
    lastSeenTick: tick,
    lastMissedTick: knew ? (previous?.lastMissedTick ?? null) : tick,
    box: knew
      ? Math.min(boxBefore + (wasLearned && fluent ? 1 : 0), LAST_BOX)
      : Math.max(boxBefore - 1, 0),
    dueDay: previous?.dueDay ?? null,
  }
  return scheduled(entry, fact, day)
}

const credited = (previous: FactProgress, fact: Fact, day: number): FactProgress =>
  scheduled(
    {
      ...previous,
      streak: Math.min(previous.streak + TWIN_CREDIT, requiredFor(fact, previous.misses)),
    },
    fact,
    day,
  )

export const recordAnswer = (
  progress: Progress,
  fact: Fact,
  knew: boolean,
  fluent: boolean,
): Progress => {
  const tick = progress.tick + 1
  const day = today()
  const facts = { ...progress.facts }
  facts[factKey(fact)] = answered(progress.facts[factKey(fact)], fact, knew, fluent, tick, day)

  const partner = twin(fact)
  const partnerEntry = progress.facts[factKey(partner)]
  if (knew && fluent && !isTie(fact) && partnerEntry && !isLearned(progress, partner)) {
    facts[factKey(partner)] = credited(partnerEntry, partner, day)
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
const BACKLOG_SPREAD_DAYS = 7

export const scheduleBacklog = (progress: Progress): Progress => {
  const day = today()
  let backlog = 0
  const facts: Record<string, FactProgress> = {}

  for (const [key, entry] of Object.entries(progress.facts)) {
    const fact = parseFactKey(key)
    if (!fact) continue

    const unscheduled = entry.dueDay === null && entry.streak >= requiredFor(fact, entry.misses)
    facts[key] = unscheduled
      ? { ...entry, dueDay: day + 1 + (backlog++ % BACKLOG_SPREAD_DAYS) }
      : entry
  }

  return { ...progress, facts }
}

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
      box: 0,
      dueDay: null,
    }
  }

  return scheduleBacklog({
    tick: legacy.tick ?? 0,
    facts,
    celebrated: legacy.celebrated ?? false,
  })
}
