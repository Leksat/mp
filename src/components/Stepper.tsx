import type { ComponentType } from 'react'
import { MinusIcon, PlusIcon } from './icons'

interface StepperProps {
  readonly icon: ComponentType<{ readonly size?: number }>
  readonly value: number
  readonly min: number
  readonly decreaseLabel: string
  readonly increaseLabel: string
  onChange(value: number): void
}

export const Stepper = ({
  icon: Icon,
  value,
  min,
  decreaseLabel,
  increaseLabel,
  onChange,
}: StepperProps) => (
  <div className="stepper">
    <Icon size={30} />
    <button
      type="button"
      className="stepper-button"
      disabled={value <= min}
      onClick={() => onChange(value - 1)}
      aria-label={decreaseLabel}
    >
      <MinusIcon size={24} />
    </button>
    <span className="stepper-value">{value}</span>
    <button
      type="button"
      className="stepper-button"
      onClick={() => onChange(value + 1)}
      aria-label={increaseLabel}
    >
      <PlusIcon size={24} />
    </button>
  </div>
)
