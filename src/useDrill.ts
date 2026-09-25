import { useState, type Dispatch, type SetStateAction } from 'react'
import { ALL_FACTS, type Fact } from './domain/facts'
import { isLearned, recordAnswer, type Progress } from './domain/progress'
import { COOLDOWN_CARDS, pickFact, previewFacts } from './domain/selection'

export interface Card {
  readonly id: number
  readonly fact: Fact
}

const nextCard = (progress: Progress, recent: readonly Fact[], id: number): Card => ({
  id,
  fact: pickFact(progress, recent),
})

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
      onSessionDone()
    }
  }

  const facts = previewFacts(progress)
  if (previewing && facts.length > 0) {
    return { phase: 'preview', facts, start: () => setPreviewing(false) }
  }

  return { phase: 'cards', card, answered, sessionLength, answer }
}
