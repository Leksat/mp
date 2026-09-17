import { CrossIcon, TrashIcon } from './icons'

interface ConfirmSheetProps {
  readonly title: string
  onConfirm(): void
  onCancel(): void
}

export const ConfirmSheet = ({ title, onConfirm, onCancel }: ConfirmSheetProps) => (
  <div className="sheet-backdrop" onClick={onCancel}>
    <div className="sheet" onClick={(event) => event.stopPropagation()}>
      <div className="sheet-title">{title}</div>

      <div className="sheet-actions">
        <button
          type="button"
          className="sheet-action danger"
          onClick={onConfirm}
          aria-label="confirm"
        >
          <TrashIcon size={26} />
        </button>
        <button type="button" className="sheet-action" onClick={onCancel} aria-label="cancel">
          <CrossIcon size={26} />
        </button>
      </div>
    </div>
  </div>
)
