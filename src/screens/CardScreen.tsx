import { useEffect, useState } from 'react'
import { CheckIcon, CrossIcon } from '../components/icons'
import { product } from '../domain/facts'
import type { VerdictPlacement } from '../domain/settings'
import type { Drill } from '../useDrill'

const REVEAL_DELAY_MS = 3000

interface CardScreenProps {
  readonly drill: Drill
  readonly verdictPlacement: VerdictPlacement
}

export const CardScreen = ({ drill, verdictPlacement }: CardScreenProps) => {
  const { card, answered, sessionLength, answer } = drill
  const [revealedCardId, setRevealedCardId] = useState<number | null>(null)
  const [waitedCardId, setWaitedCardId] = useState<number | null>(null)
  const revealed = revealedCardId === card.id
  const fluent = waitedCardId !== card.id

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealedCardId(card.id)
      setWaitedCardId(card.id)
    }, REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [card.id])

  const { left, right } = card.fact

  return (
    <div className={`card-screen verdicts-${verdictPlacement}`}>
      <div className="session">
        <div className="session-fill" style={{ width: `${(answered / sessionLength) * 100}%` }} />
      </div>

      <button
        type="button"
        className="card"
        onClick={() => setRevealedCardId(card.id)}
        aria-label="reveal"
      >
        <span className="question">
          {left} × {right}
        </span>
        <span className={`answer ${revealed ? 'visible' : ''}`}>{product(card.fact)}</span>
      </button>

      <div className="timer">
        {!revealed && (
          <div
            key={card.id}
            className="timer-fill"
            style={{ '--reveal-duration': `${REVEAL_DELAY_MS}ms` } as React.CSSProperties}
          />
        )}
      </div>

      <div className="verdicts">
        <button
          type="button"
          className="verdict missed"
          onClick={() => answer(false, fluent)}
          aria-label="not learned"
        >
          <CrossIcon size={40} />
        </button>
        <button
          type="button"
          className="verdict knew"
          onClick={() => answer(true, fluent)}
          aria-label="learned"
        >
          <CheckIcon size={40} />
        </button>
      </div>
    </div>
  )
}
