import type { Meta, StoryObj } from '@storybook/react-vite'
import { Replayable } from '../stories/Replayable'
import { Confetti } from './Confetti'
import { Firework } from './Firework'

const stayMounted = () => {}

const meta = {
  title: 'Components/Celebrations',
  component: Replayable,
} satisfies Meta<typeof Replayable>

export default meta

type Story = StoryObj<typeof meta>

export const SessionFirework: Story = {
  args: { children: <Firework bursts={1} onDone={stayMounted} /> },
}

export const TableFinishedFirework: Story = {
  args: { children: <Firework bursts={3} onDone={stayMounted} /> },
}

export const TableFinishedConfetti: Story = {
  args: { children: <Confetti onDone={stayMounted} /> },
}
