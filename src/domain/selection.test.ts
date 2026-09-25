import { describe, expect, it } from 'vitest'
import { areConfusable, ALL_FACTS, baseRequiredStreak, factKey, toFact, type Fact } from './facts'
import {
  emptyProgress,
  factState,
  fromLegacy,
  isLearned,
  recordAnswer,
  type FactProgress,
  type Progress,
} from './progress'
import { COOLDOWN_CARDS, pickFact, previewFacts, workingSet } from './selection'

const drill = (cards: number, knew: (fact: Fact) => boolean) => {
  let progress = emptyProgress()
  let recent: Fact[] = []
  const seen: Fact[] = []

  for (let card = 0; card < cards; card++) {
    const fact = pickFact(progress, recent)
    seen.push(fact)
    progress = recordAnswer(progress, fact, knew(fact))
    recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
  }

  return { progress, seen }
}

const always = () => true

describe('picking the next card', () => {
  it('never repeats a fact within the cooldown', () => {
    const { seen } = drill(300, (fact) => fact.left + fact.right < 8)
    for (const [index, fact] of seen.entries()) {
      const window = seen.slice(Math.max(0, index - COOLDOWN_CARDS), index)
      expect(window.map(factKey)).not.toContain(factKey(fact))
    }
  })

  it('prefers a candidate that is not confusable with the last card', () => {
    const settled = { streak: 9, misses: 0, lastSeenTick: 0, lastMissedTick: null }
    const facts: Record<string, FactProgress> = Object.fromEntries(
      ALL_FACTS.map((fact) => [factKey(fact), settled]),
    )
    const started = { streak: 1, misses: 0, lastSeenTick: 0, lastMissedTick: null }
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

  it('caps the working set even when many facts are already in progress', () => {
    const startedFacts = ALL_FACTS.filter((fact) => baseRequiredStreak(fact) > 1)
    const progress: Progress = {
      tick: 1,
      celebrated: false,
      facts: Object.fromEntries(
        startedFacts.map((fact) => [factKey(fact), { streak: 0, lastSeenTick: 1, lastMissedTick: null }]),
      ),
    }

    const inPlay = workingSet(progress)

    expect(inPlay).toHaveLength(7)
    expect(inPlay.every((fact) => factState(progress, fact) === 'learning')).toBe(true)
    expect(inPlay.every((fact) => baseRequiredStreak(fact) === 2)).toBe(true)
  })

  it('serves only the working set', () => {
    const progress: Progress = {
      tick: 1,
      celebrated: false,
      facts: Object.fromEntries(
        ALL_FACTS.map((fact) => [factKey(fact), { streak: 0, lastSeenTick: 1, lastMissedTick: null }]),
      ),
    }
    const inPlay = workingSet(progress).map(factKey)
    let recent: Fact[] = []

    for (let card = 0; card < 50; card++) {
      const fact = pickFact(progress, recent)
      expect(inPlay).toContain(factKey(fact))
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }
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
      progress = recordAnswer(progress, fact, true)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(servedWhileLearned).toHaveLength(0)
  })

  it('never serves a green fact while anything is still amber', () => {
    let progress = emptyProgress()
    let recent: Fact[] = []
    const greenServed: Fact[] = []

    for (let card = 0; card < 400; card++) {
      const fact = pickFact(progress, recent)
      if (isLearned(progress, fact) && ALL_FACTS.some((other) => !isLearned(progress, other))) {
        greenServed.push(fact)
      }
      progress = recordAnswer(progress, fact, card % 7 !== 0)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(greenServed).toHaveLength(0)
  })

  it('always returns a fact even once everything is learned', () => {
    let progress: Progress = emptyProgress()
    for (const fact of ALL_FACTS) {
      for (let rep = 0; rep < 8; rep++) progress = recordAnswer(progress, fact, true)
    }
    expect(pickFact(progress, [])).toBeDefined()
  })
})

describe('the preview', () => {
  it('lists the working set by product, twins side by side, smaller left factor first', () => {
    const started = { streak: 1, misses: 0, lastSeenTick: 0, lastMissedTick: null }
    const progress: Progress = {
      tick: 5,
      facts: Object.fromEntries(
        [toFact(8, 7), toFact(7, 7), toFact(3, 4), toFact(7, 8), toFact(6, 8)].map((fact) => [
          factKey(fact),
          started,
        ]),
      ),
      celebrated: false,
    }

    expect(previewFacts(progress).map(factKey)).toEqual([
      '1x1',
      '1x2',
      '3x4',
      '6x8',
      '7x7',
      '7x8',
      '8x7',
    ])
  })
})

describe('a session of correct answers', () => {
  it('still moves facts to learned', () => {
    let progress = emptyProgress()
    let recent: Fact[] = []

    for (let card = 0; card < 20; card++) {
      const fact = pickFact(progress, recent)
      progress = recordAnswer(progress, fact, true)
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
      progress = recordAnswer(progress, fact, true)
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
        progress = recordAnswer(progress, fact, factKey(fact) !== factKey(stubborn))
      }
    }

    let recent: Fact[] = []
    const seen: Fact[] = []
    for (let card = 0; card < 40; card++) {
      const fact = pickFact(progress, recent)
      seen.push(fact)
      progress = recordAnswer(progress, fact, false)
      recent = [fact, ...recent].slice(0, COOLDOWN_CARDS)
    }

    expect(seen.filter((fact) => factKey(fact) === factKey(stubborn)).length).toBeGreaterThan(1)
  })
})
