import { useState, type Dispatch, type SetStateAction } from 'react'
import { factKey, type Fact } from './domain/facts'
import { recordAnswer, type Progress } from './domain/progress'
import { COOLDOWN_CARDS, pickFact } from './domain/selection'

export interface Card {
  readonly id: number
  readonly fact: Fact
}

const nextCard = (progress: Progress, recentKeys: readonly string[], id: number): Card => ({
  id,
  fact: pickFact(progress, recentKeys),
})

export interface Drill {
  readonly card: Card
  readonly answered: number
  readonly sessionLength: number
  answer(knew: boolean): void
}

export const useDrill = (
  progress: Progress,
  setProgress: Dispatch<SetStateAction<Progress>>,
  sessionLength: number,
  onSessionDone: () => void,
): Drill => {
  const [recentKeys, setRecentKeys] = useState<readonly string[]>([])
  const [card, setCard] = useState<Card>(() => nextCard(progress, [], 0))
  const [answered, setAnswered] = useState(0)

  const answer = (knew: boolean) => {
    const updated = recordAnswer(progress, card.fact, knew)
    const updatedRecentKeys = [factKey(card.fact), ...recentKeys].slice(0, COOLDOWN_CARDS)
    const done = answered + 1 >= sessionLength

    setProgress(updated)
    setRecentKeys(updatedRecentKeys)
    setCard(nextCard(updated, updatedRecentKeys, card.id + 1))
    setAnswered(done ? 0 : answered + 1)

    if (done) onSessionDone()
  }

  return { card, answered, sessionLength, answer }
}
