import { useState, type Dispatch, type SetStateAction } from 'react'
import { ALL_FACTS, factKey, type Fact } from './domain/facts'
import { isLearned, recordAnswer, type Progress } from './domain/progress'
import { COOLDOWN_CARDS, pickFact, workingSet } from './domain/selection'
import { shuffled } from './domain/shuffle'

export interface Card {
  readonly id: number
  readonly fact: Fact
}

const nextCard = (progress: Progress, recent: readonly Fact[], id: number): Card => ({
  id,
  fact: pickFact(progress, recent),
})

const shuffledFacts = (): readonly Fact[] => shuffled(ALL_FACTS, Math.random)

const previewFacts = (progress: Progress, order: readonly Fact[]): readonly Fact[] => {
  const inPlay = new Set(workingSet(progress).map(factKey))
  return order.filter((fact) => inPlay.has(factKey(fact)))
}

export interface PreviewDrill {
  readonly phase: 'preview'
  readonly facts: readonly Fact[]
  start(): void
}

export interface CardsDrill {
  readonly phase: 'cards'
  readonly card: Card
  readonly answered: number
  readonly sessionLength: number
  answer(knew: boolean): void
}

export type Drill = PreviewDrill | CardsDrill

export const useDrill = (
  progress: Progress,
  setProgress: Dispatch<SetStateAction<Progress>>,
  sessionLength: number,
  onSessionDone: () => void,
): Drill => {
  const [recent, setRecent] = useState<readonly Fact[]>([])
  const [card, setCard] = useState<Card>(() => nextCard(progress, [], 0))
  const [answered, setAnswered] = useState(0)
  const [previewing, setPreviewing] = useState(true)
  const [order, setOrder] = useState(shuffledFacts)

  const answer = (knew: boolean) => {
    const updated = recordAnswer(progress, card.fact, knew)
    const updatedRecent = [card.fact, ...recent].slice(0, COOLDOWN_CARDS)
    const tableFinished = ALL_FACTS.every((fact) => isLearned(updated, fact))
    const done = tableFinished || answered + 1 >= sessionLength

    setProgress(updated)
    setRecent(updatedRecent)
    setCard(nextCard(updated, updatedRecent, card.id + 1))
    setAnswered(done ? 0 : answered + 1)

    if (done) {
      setPreviewing(true)
      setOrder(shuffledFacts())
      onSessionDone()
    }
  }

  const facts = previewFacts(progress, order)
  if (previewing && facts.length > 0) {
    return { phase: 'preview', facts, start: () => setPreviewing(false) }
  }

  return { phase: 'cards', card, answered, sessionLength, answer }
}
