import { Fragment } from 'react'
import { PlayIcon } from '../components/icons'
import { factKey, product } from '../domain/facts'
import type { VerdictPlacement } from '../domain/settings'
import type { PreviewDrill } from '../useDrill'

interface PreviewScreenProps {
  readonly drill: PreviewDrill
  readonly verdictPlacement: VerdictPlacement
}

export const PreviewScreen = ({ drill, verdictPlacement }: PreviewScreenProps) => (
  <div className={`card-screen verdicts-${verdictPlacement}`}>
    <div className="card preview">
      <div className="preview-facts">
        {drill.facts.map((fact) => (
          <Fragment key={factKey(fact)}>
            <span>{fact.left}</span>
            <span>×</span>
            <span>{fact.right}</span>
            <span>=</span>
            <span className="preview-answer">{product(fact)}</span>
          </Fragment>
        ))}
      </div>
    </div>

    <button type="button" className="verdict ready" onClick={drill.start} aria-label="ready">
      <PlayIcon size={40} />
    </button>
  </div>
)
