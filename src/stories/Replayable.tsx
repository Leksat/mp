import { Fragment, useState, type ReactNode } from 'react'
import { ResetIcon } from '../components/icons'

export const Replayable = ({ children }: { readonly children: ReactNode }) => {
  const [round, setRound] = useState(0)

  return (
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <button
        type="button"
        className="sheet-action"
        onClick={() => setRound((current) => current + 1)}
        aria-label="replay"
      >
        <ResetIcon size={26} />
      </button>
      <Fragment key={round}>{children}</Fragment>
    </div>
  )
}
