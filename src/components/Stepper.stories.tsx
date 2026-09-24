import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CardIcon, TimerIcon } from './icons'
import { Stepper } from './Stepper'

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: { layout: 'centered' },
  args: {
    icon: CardIcon,
    value: 20,
    min: 1,
    decreaseLabel: 'shorter session',
    increaseLabel: 'longer session',
    onChange: fn(),
  },
} satisfies Meta<typeof Stepper>

export default meta

type Story = StoryObj<typeof meta>

export const SessionLength: Story = {}

export const RevealDelay: Story = {
  args: {
    icon: TimerIcon,
    value: 3,
    decreaseLabel: 'reveal sooner',
    increaseLabel: 'reveal later',
  },
}

export const AtMinimum: Story = {
  args: { value: 1 },
}
