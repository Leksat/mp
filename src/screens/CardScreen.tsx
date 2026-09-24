import { useEffect, useState } from 'react'
import { CheckIcon, CrossIcon } from '../components/icons'
import { product } from '../domain/facts'
import type { VerdictPlacement } from '../domain/settings'
import type { CardsDrill } from '../useDrill'

interface CardScreenProps {
  readonly drill: CardsDrill
  readonly verdictPlacement: VerdictPlacement
  readonly revealDelaySeconds: number
}

export const CardScreen = ({ drill, verdictPlacement, revealDelaySeconds }: CardScreenProps) => {
  const { card, answered, sessionLength, answer } = drill
  const [revealedCardId, setRevealedCardId] = useState<number | null>(null)
  const revealed = revealedCardId === card.id
  const revealDelayMs = revealDelaySeconds * 1000

  useEffect(() => {
    const timer = setTimeout(() => setRevealedCardId(card.id), revealDelayMs)
    return () => clearTimeout(timer)
  }, [card.id, revealDelayMs])

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
            style={{ '--reveal-duration': `${revealDelayMs}ms` } as React.CSSProperties}
          />
        )}
      </div>

      <div className="verdicts">
        <button
          type="button"
          className="verdict missed"
          onClick={() => answer(false)}
          aria-label="not learned"
        >
          <CrossIcon size={40} />
        </button>
        <button
          type="button"
          className="verdict knew"
          onClick={() => answer(true)}
          aria-label="learned"
        >
          <CheckIcon size={40} />
        </button>
      </div>
    </div>
  )
}
