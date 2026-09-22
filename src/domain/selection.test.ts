import { describe, expect, it } from 'vitest'
import { areConfusable, ALL_FACTS, baseRequiredStreak, factKey, toFact, type Fact } from './facts'
import {
  emptyProgress,
  factState,
  fromLegacy,
  isLearned,
  recordAnswer,
  today,
  type FactProgress,
  type Progress,
} from './progress'
import { COOLDOWN_CARDS, pickFact } from './selection'

const drill = (cards: number, knew: (fact: Fact) => boolean, fluent = true) => {
  let progress = emptyProgress()
  let recent: Fact[] = []
  const seen: Fact[] = []

  for (let card = 0; card < cards; card++) {
    const fact = pickFact(progress, recent)
    seen.push(fact)
    progress = recordAnswer(progress, fact, knew(fact), fluent)
    recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
  }

  return { progress, seen }
}

const always = () => true

describe('picking the next card', () => {
  it('never repeats a fact within the cooldown', () => {
    const { seen } = drill(300, always)
    for (const [index, fact] of seen.entries()) {
      const window = seen.slice(Math.max(0, index - COOLDOWN_CARDS), index)
      expect(window.map(factKey)).not.toContain(factKey(fact))
    }
  })

  it('prefers a candidate that is not confusable with the last card', () => {
    const settled = { streak: 9, misses: 0, lastSeenTick: 0, lastMissedTick: null, box: 4 }
    const facts: Record<string, FactProgress> = Object.fromEntries(
      ALL_FACTS.map((fact) => [factKey(fact), { ...settled, dueDay: today() + 99 }]),
    )
    const started = { streak: 1, misses: 0, lastSeenTick: 0, lastMissedTick: null, box: 0, dueDay: null }
    facts['6x8'] = started
    facts['3x4'] = started
    const progress = { tick: 10, facts, celebrated: false }

    expect(areConfusable(toFact(7, 8), toFact(6, 8))).toBe(true)
    expect(areConfusable(toFact(7, 8), toFact(3, 4))).toBe(false)
    for (let attempt = 0; attempt < 20; attempt++) {
      expect(factKey(pickFact(progress, [toFact(7, 8)]))).toBe('3x4')
    }
  })

  it('holds the working set to a handful of facts at a time', () => {
    const { progress } = drill(200, (fact) => fact.left + fact.right < 8)
    const started = ALL_FACTS.filter((fact) => factState(progress, fact) === 'learning')
    expect(started.length).toBeLessThanOrEqual(7)
  })

  it('introduces the easy facts before the hard ones', () => {
    const { seen } = drill(20, always)
    expect(seen.every((fact) => baseRequiredStreak(fact) === 1)).toBe(true)
  })

  it('does not serve a migrated learned fact while there is work to do', () => {
    const legacy = {
      tick: 1,
      celebrated: false,
      facts: Object.fromEntries(
        ALL_FACTS.map((fact) => [factKey(fact), { streak: 2, lastSeenTick: 1, lastMissedTick: null }]),
      ),
    }
    let progress = fromLegacy(legacy)
    let recent: Fact[] = []
    const servedWhileLearned: Fact[] = []

    for (let card = 0; card < 20; card++) {
      const fact = pickFact(progress, recent)
      if (isLearned(progress, fact)) servedWhileLearned.push(fact)
      progress = recordAnswer(progress, fact, true, true)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(servedWhileLearned).toHaveLength(0)
  })

  it('falls back to the next fact due, never to an ancient easy one', () => {
    const settled = { streak: 9, misses: 0, lastSeenTick: 0, lastMissedTick: null, box: 4 }
    const facts = Object.fromEntries(
      ALL_FACTS.map((fact, index) => [
        factKey(fact),
        { ...settled, lastSeenTick: index, dueDay: today() + 200 - index },
      ]),
    )
    const progress = { tick: 500, facts, celebrated: false }
    const soonestQuarter = ALL_FACTS.slice(-25).map(factKey)

    for (let attempt = 0; attempt < 20; attempt++) {
      expect(soonestQuarter).toContain(factKey(pickFact(progress, [])))
    }
  })

  it('varies the cards when there is nothing due and nothing to drill', () => {
    const settled = { streak: 9, misses: 0, lastSeenTick: 0, lastMissedTick: null, box: 4 }
    const facts: Record<string, FactProgress> = Object.fromEntries(
      ALL_FACTS.map((fact, index) => [
        factKey(fact),
        { ...settled, lastSeenTick: index, dueDay: today() + 30 + index },
      ]),
    )
    let progress: Progress = { tick: 500, facts, celebrated: false }
    let recent: Fact[] = []
    const seen: Fact[] = []

    for (let card = 0; card < 20; card++) {
      const fact = pickFact(progress, recent)
      seen.push(fact)
      progress = recordAnswer(progress, fact, true, false)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(new Set(seen.map(factKey)).size).toBeGreaterThan(10)
  })

  it('does not drill a learned fact that is not due yet', () => {
    const { progress, seen } = drill(60, always)
    const learnedWhenSeen = seen.filter((fact) => isLearned(progress, fact))
    expect(learnedWhenSeen.length).toBeLessThan(seen.length)
  })

  it('always returns a fact even once everything is learned', () => {
    let progress: Progress = emptyProgress()
    for (const fact of ALL_FACTS) {
      for (let rep = 0; rep < 8; rep++) progress = recordAnswer(progress, fact, true, true)
    }
    expect(pickFact(progress, [])).toBeDefined()
  })
})

describe('a session of slow but correct answers', () => {
  it('still moves facts to learned', () => {
    let progress = emptyProgress()
    let recent: Fact[] = []

    for (let card = 0; card < 20; card++) {
      const fact = pickFact(progress, recent)
      progress = recordAnswer(progress, fact, true, false)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(ALL_FACTS.filter((fact) => isLearned(progress, fact)).length).toBeGreaterThan(0)
  })

  it('eventually finishes the whole table', () => {
    let progress = emptyProgress()
    let recent: Fact[] = []
    let cards = 0

    while (ALL_FACTS.some((fact) => !isLearned(progress, fact)) && cards < 5000) {
      const fact = pickFact(progress, recent)
      progress = recordAnswer(progress, fact, true, false)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
      cards++
    }

    expect(cards).toBeLessThan(5000)
  })
})

describe('a kid who keeps missing one fact', () => {
  it('brings it back more often than the rest', () => {
    const stubborn = toFact(7, 8)
    let progress = emptyProgress()
    for (const fact of ALL_FACTS) {
      for (let rep = 0; rep < 8; rep++) {
        progress = recordAnswer(progress, fact, factKey(fact) !== factKey(stubborn), true)
      }
    }

    let recent: Fact[] = []
    const seen: Fact[] = []
    for (let card = 0; card < 40; card++) {
      const fact = pickFact(progress, recent)
      seen.push(fact)
      progress = recordAnswer(progress, fact, false, false)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(seen.filter((fact) => factKey(fact) === factKey(stubborn)).length).toBeGreaterThan(1)
  })
})
