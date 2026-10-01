import { useState, type ComponentType } from 'react'
import { BUILD_TIME } from '../buildTime'
import { ConfirmSheet } from '../components/ConfirmSheet'
import {
  CardIcon,
  DownloadIcon,
  LayoutBottomIcon,
  LayoutTopIcon,
  RulesLearnedIcon,
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
  onLearnRuleFacts(): void
  onUpdate(): void
}

type Confirming = 'clear' | 'learn-rules' | null

export const SettingsScreen = ({
  settings,
  updateReady,
  onChange,
  onClearProgress,
  onLearnRuleFacts,
  onUpdate,
}: SettingsScreenProps) => {
  const [confirming, setConfirming] = useState<Confirming>(null)

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
            className="learn-action"
            onClick={() => setConfirming('learn-rules')}
            aria-label="mark ×1 and ×10 learned"
          >
            <RulesLearnedIcon size={26} />
          </button>

          <button
            type="button"
            className="danger-action"
            onClick={() => setConfirming('clear')}
            aria-label="clear progress"
          >
            <TrashIcon size={26} />
          </button>
        </div>

        <div className="build-id">{BUILD_TIME}</div>
      </div>

      {confirming === 'learn-rules' && (
        <ConfirmSheet
          title="Mark ×1 and ×10 as learned?"
          tone="learned"
          onConfirm={() => {
            onLearnRuleFacts()
            setConfirming(null)
          }}
          onCancel={() => setConfirming(null)}
        />
      )}

      {confirming === 'clear' && (
        <ConfirmSheet
          title="Clear all progress?"
          tone="danger"
          onConfirm={() => {
            onClearProgress()
            setConfirming(null)
          }}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  )
}
