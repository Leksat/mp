import { product, type Fact } from '../domain/facts'
import { factStreak, requiredStreak, type Progress } from '../domain/progress'
import { CrossIcon, ResetIcon } from './icons'

interface FactSheetProps {
  readonly fact: Fact
  readonly progress: Progress
  onForget(): void
  onClose(): void
}

export const FactSheet = ({ fact, progress, onForget, onClose }: FactSheetProps) => {
  const streak = factStreak(progress, fact)
  const required = requiredStreak(fact)
  const pipTone = (index: number): number => Math.min(3, Math.ceil(((index + 1) / required) * 3))

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-fact">
          {fact.left} × {fact.right} = {product(fact)}
        </div>

        <div className="streak">
          {Array.from({ length: required }, (_, index) => (
            <span
              key={index}
              className={index < streak ? `pip filled tone-${pipTone(index)}` : 'pip'}
            />
          ))}
        </div>

        <div className="sheet-actions">
          <button type="button" className="sheet-action" onClick={onForget} aria-label="reset">
            <ResetIcon size={26} />
          </button>
          <button type="button" className="sheet-action" onClick={onClose} aria-label="close">
            <CrossIcon size={26} />
          </button>
        </div>
      </div>
    </div>
  )
}
