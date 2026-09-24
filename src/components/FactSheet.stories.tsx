import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { toFact } from '../domain/facts'
import { emptyProgress, recordAnswer, type Progress } from '../domain/progress'
import { completeProgress } from '../stories/progress'
import { FactSheet } from './FactSheet'

const HARD_FACT = toFact(7, 8)

const hardFactAnswered = (correct: number): Progress =>
  Array.from({ length: correct }).reduce<Progress>(
    (progress) => recordAnswer(progress, HARD_FACT, true),
    emptyProgress(),
  )

const meta = {
  title: 'Components/FactSheet',
  component: FactSheet,
  args: {
    fact: HARD_FACT,
    progress: hardFactAnswered(3),
    onForget: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof FactSheet>

export default meta

type Story = StoryObj<typeof meta>

export const Untouched: Story = {
  args: { progress: emptyProgress() },
}

export const Learning: Story = {}

export const Learned: Story = {
  args: { progress: completeProgress },
}

export const RuleFact: Story = {
  args: { fact: toFact(1, 6), progress: emptyProgress() },
}
