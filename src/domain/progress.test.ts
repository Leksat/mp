import { describe, expect, it } from 'vitest'
import { ALL_FACTS, baseRequiredStreak, toFact } from './facts'
import {
  emptyProgress,
  factState,
  factStreak,
  fromLegacy,
  isDueForReview,
  learnedPercent,
  recordAnswer,
  requiredStreak,
  today,
  type Progress,
} from './progress'

const answerTimes = (
  progress: Progress,
  fact: ReturnType<typeof toFact>,
  times: number,
  knew: boolean,
): Progress =>
  Array.from({ length: times }).reduce<Progress>(
    (current) => recordAnswer(current, fact, knew),
    progress,
  )

describe('reaching learned', () => {
  it('learns a rule fact in one answer', () => {
    const fact = toFact(1, 6)
    const progress = recordAnswer(emptyProgress(), fact, true)
    expect(factState(progress, fact)).toBe('learned')
  })

  it('learns the hard core in five answers, not fewer', () => {
    const fact = toFact(7, 8)
    const four = answerTimes(emptyProgress(), fact, 4, true)
    expect(factState(four, fact)).toBe('learning')
    expect(factState(recordAnswer(four, fact, true), fact)).toBe('learned')
  })

  it('counts every ✓ the same, whenever the button is tapped', () => {
    const fact = toFact(7, 8)
    const one = recordAnswer(emptyProgress(), fact, true)
    expect(factStreak(one, fact)).toBe(1)
  })

  it('never advances past the requirement', () => {
    const fact = toFact(2, 6)
    const progress = answerTimes(emptyProgress(), fact, 9, true)
    expect(factStreak(progress, fact)).toBe(requiredStreak(progress, fact))
  })
})

describe('missing a fact', () => {
  const missedOnce = (left: number, right: number) => {
    const fact = toFact(left, right)
    const learned = answerTimes(emptyProgress(), fact, 8, true)
    expect(factState(learned, fact)).toBe('learned')
    return { fact, after: recordAnswer(learned, fact, false) }
  }

  it('costs a rule fact a single rep it wins straight back', () => {
    const { fact, after } = missedOnce(1, 6)
    expect(factStreak(after, fact)).toBe(0)
    expect(requiredStreak(after, fact)).toBe(1)
    expect(factState(recordAnswer(after, fact, true), fact)).toBe('learned')
  })

  it('keeps most of a hard fact instead of resetting it', () => {
    const { fact, after } = missedOnce(7, 8)
    expect(factStreak(after, fact)).toBe(3)
    expect(requiredStreak(after, fact)).toBe(6)
  })

  it('raises the requirement only after repeated misses', () => {
    const fact = toFact(1, 6)
    const twice = answerTimes(emptyProgress(), fact, 2, false)
    expect(requiredStreak(twice, fact)).toBe(1)
    expect(requiredStreak(recordAnswer(twice, fact, false), fact)).toBe(2)
  })

  it('never lets the requirement run away', () => {
    const fact = toFact(7, 8)
    const progress = answerTimes(emptyProgress(), fact, 40, false)
    expect(requiredStreak(progress, fact)).toBeLessThanOrEqual(8)
    expect(factStreak(progress, fact)).toBe(0)
  })
})

describe('twin credit', () => {
  it('gives a started twin half a step', () => {
    const fact = toFact(4, 7)
    const twin = toFact(7, 4)
    const started = recordAnswer(emptyProgress(), twin, true)
    const after = recordAnswer(started, fact, true)
    expect(factStreak(after, twin)).toBeGreaterThan(factStreak(started, twin))
  })

  it('leaves an untouched twin untouched', () => {
    const after = recordAnswer(emptyProgress(), toFact(4, 7), true)
    expect(factState(after, toFact(7, 4))).toBe('untouched')
  })
})

describe('review scheduling', () => {
  it('holds a freshly learned fact back until tomorrow', () => {
    const fact = toFact(3, 4)
    const progress = answerTimes(emptyProgress(), fact, 3, true)
    expect(isDueForReview(progress, fact, today())).toBe(false)
    expect(isDueForReview(progress, fact, today() + 1)).toBe(true)
  })

  it('pushes each review further out', () => {
    const fact = toFact(3, 4)
    let progress = answerTimes(emptyProgress(), fact, 3, true)
    const firstDue = progress.facts['3x4'].dueDay
    progress = recordAnswer(progress, fact, true)
    expect(progress.facts['3x4'].dueDay).toBeGreaterThan(firstDue!)
  })

  it('pushes a review out every time, so a ✓ always buys distance', () => {
    const fact = toFact(3, 4)
    let progress = answerTimes(emptyProgress(), fact, 3, true)
    let due = progress.facts['3x4'].dueDay!

    for (let review = 0; review < 4; review++) {
      progress = recordAnswer(progress, fact, true)
      const next = progress.facts['3x4'].dueDay!
      expect(next).toBeGreaterThan(due)
      due = next
    }
  })

  it('brings a missed review back sooner', () => {
    const fact = toFact(3, 4)
    let progress = answerTimes(emptyProgress(), fact, 3, true)
    progress = answerTimes(progress, fact, 3, true)
    const far = progress.facts['3x4'].box
    progress = recordAnswer(progress, fact, false)
    expect(progress.facts['3x4'].box).toBeLessThan(far)
  })
})

describe('the score', () => {
  it('starts at zero and ends at a hundred', () => {
    expect(learnedPercent(emptyProgress())).toBe(0)
    const everything = ALL_FACTS.reduce(
      (current, fact) => answerTimes(current, fact, 8, true),
      emptyProgress(),
    )
    expect(learnedPercent(everything)).toBe(100)
  })

  it('does not shrink when a fact gets harder', () => {
    const fact = toFact(7, 8)
    const learned = answerTimes(emptyProgress(), fact, 5, true)
    const missed = answerTimes(learned, fact, 3, false)
    const relearned = answerTimes(missed, fact, 8, true)
    expect(learnedPercent(relearned)).toBe(learnedPercent(learned))
  })
})

describe('migrating from v2', () => {
  const legacy = {
    tick: 40,
    celebrated: false,
    facts: {
      '7x8': { streak: 3, lastSeenTick: 30, lastMissedTick: 10 },
      '1x4': { streak: 2, lastSeenTick: 5, lastMissedTick: null },
      '2x2': { streak: 1, lastSeenTick: 20, lastMissedTick: null },
      rubbish: { streak: 3, lastSeenTick: 1, lastMissedTick: null },
    },
  }

  it('demotes nothing that was already learned', () => {
    const progress = fromLegacy(legacy)
    expect(factState(progress, toFact(7, 8))).toBe('learned')
    expect(factState(progress, toFact(1, 4))).toBe('learned')
  })

  it('keeps a part-learned fact part-learned', () => {
    expect(factState(fromLegacy(legacy), toFact(2, 2))).toBe('learning')
  })

  it('drops keys that are not facts', () => {
    expect(Object.keys(fromLegacy(legacy))).not.toContain('rubbish')
    expect(fromLegacy(legacy).facts.rubbish).toBeUndefined()
  })

  it('spreads the review backlog instead of dumping it on day one', () => {
    const many = Object.fromEntries(
      ALL_FACTS.map((fact) => [
        `${fact.left}x${fact.right}`,
        { streak: 3, lastSeenTick: 1, lastMissedTick: null },
      ]),
    )
    const progress = fromLegacy({ tick: 1, celebrated: false, facts: many })
    const due = ALL_FACTS.filter((fact) => isDueForReview(progress, fact, today()))
    expect(due.length).toBeLessThan(ALL_FACTS.length / 2)
  })

  it('gives every migrated learned fact a review date', () => {
    const many = Object.fromEntries(
      ALL_FACTS.map((fact) => [
        `${fact.left}x${fact.right}`,
        { streak: 2, lastSeenTick: 1, lastMissedTick: null },
      ]),
    )
    const progress = fromLegacy({ tick: 1, celebrated: false, facts: many })
    const learnedWithoutDate = ALL_FACTS.filter(
      (fact) =>
        factState(progress, fact) === 'learned' &&
        progress.facts[`${fact.left}x${fact.right}`].dueDay === null,
    )
    expect(learnedWithoutDate).toHaveLength(0)
    expect(ALL_FACTS.filter((fact) => isDueForReview(progress, fact, today()))).toHaveLength(0)
  })

  it('carries the base requirement over, not the legacy three', () => {
    const progress = fromLegacy(legacy)
    expect(requiredStreak(progress, toFact(1, 4))).toBe(baseRequiredStreak(toFact(1, 4)))
  })
})
