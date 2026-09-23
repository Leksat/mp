import { useState } from 'react'
import { FactSheet } from '../components/FactSheet'
import { FACTORS, toFact, type Fact } from '../domain/facts'
import { factFill, factState, learnedPercent, type Progress } from '../domain/progress'

interface GridScreenProps {
  readonly progress: Progress
  onForget(fact: Fact): void
}

interface TableStyle extends React.CSSProperties {
  readonly '--columns': number
}

const TOP_STEP = 5

const cellStep = (progress: Progress, fact: Fact): number => {
  const state = factState(progress, fact)
  if (state === 'untouched') return 0
  if (state === 'learned') return TOP_STEP
  return Math.min(TOP_STEP - 1, Math.max(1, Math.round(factFill(progress, fact) * TOP_STEP)))
}

const tableStyle: TableStyle = { '--columns': FACTORS.length + 1 }

export const GridScreen = ({ progress, onForget }: GridScreenProps) => {
  const [selected, setSelected] = useState<Fact | null>(null)

  return (
    <div className="grid-screen">
      <div className="score">{learnedPercent(progress)}%</div>

      <div className="table" style={tableStyle}>
        <div className="corner" />
        {FACTORS.map((factor) => (
          <div key={`head-${factor}`} className="head">
            {factor}
          </div>
        ))}
        {FACTORS.flatMap((row) => [
          <div key={`head-row-${row}`} className="head">
            {row}
          </div>,
          ...FACTORS.map((column) => {
            const fact = toFact(row, column)
            return (
              <button
                type="button"
                key={`cell-${row}-${column}`}
                className={`cell step-${cellStep(progress, fact)}`}
                onClick={() => setSelected(fact)}
                aria-label={`${row} × ${column}`}
              >
                {row * column}
              </button>
            )
          }),
        ])}
      </div>

      {selected && (
        <FactSheet
          fact={selected}
          progress={progress}
          onForget={() => {
            onForget(selected)
            setSelected(null)
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
