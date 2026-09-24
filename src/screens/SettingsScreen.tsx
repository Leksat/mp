import { useState, type ComponentType } from 'react'
import { BUILD_TIME } from '../buildTime'
import { ConfirmSheet } from '../components/ConfirmSheet'
import {
  CardIcon,
  DownloadIcon,
  LayoutBottomIcon,
  LayoutTopIcon,
  TimerIcon,
  TrashIcon,
} from '../components/icons'
import { Stepper } from '../components/Stepper'
import {
  MIN_REVEAL_DELAY_SECONDS,
  MIN_SESSION_LENGTH,
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

      <Stepper
        icon={CardIcon}
        value={settings.sessionLength}
        min={MIN_SESSION_LENGTH}
        decreaseLabel="shorter session"
        increaseLabel="longer session"
        onChange={(sessionLength) => onChange({ ...settings, sessionLength })}
      />

      <Stepper
        icon={TimerIcon}
        value={settings.revealDelaySeconds}
        min={MIN_REVEAL_DELAY_SECONDS}
        decreaseLabel="reveal sooner"
        increaseLabel="reveal later"
        onChange={(revealDelaySeconds) => onChange({ ...settings, revealDelaySeconds })}
      />

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

        <div className="build-id">{BUILD_TIME}</div>
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
