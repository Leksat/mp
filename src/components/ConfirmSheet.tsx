import type { ComponentType } from 'react'
import { CheckIcon, CrossIcon, TrashIcon } from './icons'

export type ConfirmTone = 'danger' | 'learned'

const TONE_ICONS: Record<ConfirmTone, ComponentType<{ readonly size?: number }>> = {
  danger: TrashIcon,
  learned: CheckIcon,
}

interface ConfirmSheetProps {
  readonly title: string
  readonly tone: ConfirmTone
  onConfirm(): void
  onCancel(): void
}

export const ConfirmSheet = ({ title, tone, onConfirm, onCancel }: ConfirmSheetProps) => {
  const ConfirmIcon = TONE_ICONS[tone]

  return (
    <div className="sheet-backdrop" onClick={onCancel}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-title">{title}</div>

        <div className="sheet-actions">
          <button
            type="button"
            className={`sheet-action ${tone}`}
            onClick={onConfirm}
            aria-label="confirm"
          >
            <ConfirmIcon size={26} />
          </button>
          <button type="button" className="sheet-action" onClick={onCancel} aria-label="cancel">
            <CrossIcon size={26} />
          </button>
        </div>
      </div>
    </div>
  )
}
