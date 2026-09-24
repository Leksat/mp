import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { emptyProgress } from '../domain/progress'
import { AppFrame } from '../stories/AppFrame'
import { completeProgress, midwayProgress, rampedProgress } from '../stories/progress'
import { GridScreen } from './GridScreen'

const meta = {
  title: 'Screens/GridScreen',
  component: GridScreen,
  decorators: [
    (Story) => (
      <AppFrame screen="grid">
        <Story />
      </AppFrame>
    ),
  ],
  args: {
    progress: midwayProgress,
    onForget: fn(),
  },
} satisfies Meta<typeof GridScreen>

export default meta

type Story = StoryObj<typeof meta>

export const Untouched: Story = {
  args: { progress: emptyProgress() },
}

export const Midway: Story = {}

export const EveryStreakColour: Story = {
  args: { progress: rampedProgress() },
}

export const Complete: Story = {
  args: { progress: completeProgress },
}

export const FactOpen: Story = {
  args: { progress: rampedProgress() },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '7 × 8' }))
  },
}
