import { useState } from 'react'
import { FactSheet } from '../components/FactSheet'
import { ALL_FACTS, FACTORS, toFact, type Fact } from '../domain/facts'
import { factState, learnedCount, type Progress } from '../domain/progress'

interface GridScreenProps {
  readonly progress: Progress
  onForget(fact: Fact): void
}

export const GridScreen = ({ progress, onForget }: GridScreenProps) => {
  const [selected, setSelected] = useState<Fact | null>(null)

  return (
    <div className="grid-screen">
      <div className="score">
        <span className="score-done">{learnedCount(progress)}</span>
        <span className="score-sep">/</span>
        <span className="score-total">{ALL_FACTS.length}</span>
      </div>

      <div className="table" style={{ '--columns': FACTORS.length + 1 } as React.CSSProperties}>
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
                className={`cell ${factState(progress, fact)}`}
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
