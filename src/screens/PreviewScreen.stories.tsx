import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { toFact } from '../domain/facts'
import { AppFrame } from '../stories/AppFrame'
import { inProgressFacts } from '../stories/progress'
import { PreviewScreen } from './PreviewScreen'

const meta = {
  title: 'Screens/PreviewScreen',
  component: PreviewScreen,
  decorators: [
    (Story) => (
      <AppFrame screen="cards">
        <Story />
      </AppFrame>
    ),
  ],
  args: {
    drill: { phase: 'preview', facts: inProgressFacts, start: fn() },
    verdictPlacement: 'bottom',
  },
} satisfies Meta<typeof PreviewScreen>

export default meta

type Story = StoryObj<typeof meta>

export const FullSlots: Story = {}

export const SingleFact: Story = {
  args: {
    drill: { phase: 'preview', facts: [toFact(7, 8)], start: fn() },
  },
}

export const ButtonsOnTop: Story = {
  args: { verdictPlacement: 'top' },
}
