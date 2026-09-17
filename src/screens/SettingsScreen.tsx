import { useState, type ComponentType } from 'react'
import { ConfirmSheet } from '../components/ConfirmSheet'
import { LayoutBottomIcon, LayoutTopIcon, TrashIcon } from '../components/icons'
import {
  VERDICT_PLACEMENTS,
  type Settings,
  type VerdictPlacement,
} from '../domain/settings'

const PLACEMENT_ICONS: Record<VerdictPlacement, ComponentType<{ readonly size?: number }>> = {
  top: LayoutTopIcon,
  bottom: LayoutBottomIcon,
}

interface SettingsScreenProps {
  readonly settings: Settings
  onChange(settings: Settings): void
  onClearProgress(): void
}

export const SettingsScreen = ({ settings, onChange, onClearProgress }: SettingsScreenProps) => {
  const [confirmingClear, setConfirmingClear] = useState(false)

  return (
    <div className="settings-screen">
      <div className="choice">
        {VERDICT_PLACEMENTS.map((placement) => {
          const Icon = PLACEMENT_ICONS[placement]
          return (
            <button
              key={placement}
              type="button"
              className={`choice-option ${settings.verdictPlacement === placement ? 'active' : ''}`}
              onClick={() => onChange({ ...settings, verdictPlacement: placement })}
              aria-label={`buttons ${placement}`}
            >
              <Icon size={34} />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="danger-action"
        onClick={() => setConfirmingClear(true)}
        aria-label="clear progress"
      >
        <TrashIcon size={26} />
      </button>

      {confirmingClear && (
        <ConfirmSheet
          title="Clear all progress?"
          onConfirm={() => {
            onClearProgress()
            setConfirmingClear(false)
          }}
          onCancel={() => setConfirmingClear(false)}
        />
      )}
    </div>
  )
}
