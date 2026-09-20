import { useState, type ComponentType } from 'react'
import { ConfirmSheet } from '../components/ConfirmSheet'
import {
  CardIcon,
  DownloadIcon,
  LayoutBottomIcon,
  LayoutTopIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons'
import {
  MIN_SESSION_LENGTH,
  VERDICT_PLACEMENTS,
  type Settings,
  type VerdictPlacement,
} from '../domain/settings'
import { BUILD_ID } from '../pwa'

const PLACEMENT_ICONS: Record<VerdictPlacement, ComponentType<{ readonly size?: number }>> = {
  top: LayoutTopIcon,
  bottom: LayoutBottomIcon,
}

interface SettingsScreenProps {
  readonly settings: Settings
  readonly updateReady: boolean
  onChange(settings: Settings): void
  onClearProgress(): void
  onUpdate(): void
}

export const SettingsScreen = ({
  settings,
  updateReady,
  onChange,
  onClearProgress,
  onUpdate,
}: SettingsScreenProps) => {
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

      <div className="stepper">
        <CardIcon size={30} />
        <button
          type="button"
          className="stepper-button"
          disabled={settings.sessionLength <= MIN_SESSION_LENGTH}
          onClick={() => onChange({ ...settings, sessionLength: settings.sessionLength - 1 })}
          aria-label="shorter session"
        >
          <MinusIcon size={24} />
        </button>
        <span className="stepper-value">{settings.sessionLength}</span>
        <button
          type="button"
          className="stepper-button"
          onClick={() => onChange({ ...settings, sessionLength: settings.sessionLength + 1 })}
          aria-label="longer session"
        >
          <PlusIcon size={24} />
        </button>
      </div>

      <div className="settings-footer">
        <div className="footer-actions">
          {updateReady && (
            <button
              type="button"
              className="update-action"
              onClick={onUpdate}
              aria-label="install update"
            >
              <DownloadIcon size={26} />
            </button>
          )}

          <button
            type="button"
            className="danger-action"
            onClick={() => setConfirmingClear(true)}
            aria-label="clear progress"
          >
            <TrashIcon size={26} />
          </button>
        </div>

        <div className="build-id">{BUILD_ID}</div>
      </div>

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
