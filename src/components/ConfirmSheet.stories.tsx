import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ConfirmSheet } from './ConfirmSheet'

const meta = {
  title: 'Components/ConfirmSheet',
  component: ConfirmSheet,
  args: {
    title: 'Clear all progress?',
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmSheet>

export default meta

type Story = StoryObj<typeof meta>

export const ClearProgress: Story = {}
