import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { toFact } from '../domain/facts'
import { AppFrame } from '../stories/AppFrame'
import { CardScreen } from './CardScreen'

const meta = {
  title: 'Screens/CardScreen',
  component: CardScreen,
  decorators: [
    (Story) => (
      <AppFrame screen="cards">
        <Story />
      </AppFrame>
    ),
  ],
  args: {
    drill: {
      phase: 'cards',
      card: { id: 0, fact: toFact(7, 8) },
      answered: 6,
      sessionLength: 20,
      answer: fn(),
    },
    verdictPlacement: 'bottom',
    revealDelaySeconds: 3,
  },
} satisfies Meta<typeof CardScreen>

export default meta

type Story = StoryObj<typeof meta>

export const Question: Story = {}

export const Revealed: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'reveal' }))
  },
}

export const ButtonsOnTop: Story = {
  args: { verdictPlacement: 'top' },
}

export const SlowReveal: Story = {
  args: { revealDelaySeconds: 10 },
}

export const LastCard: Story = {
  args: {
    drill: {
      phase: 'cards',
      card: { id: 0, fact: toFact(10, 10) },
      answered: 19,
      sessionLength: 20,
      answer: fn(),
    },
  },
}
