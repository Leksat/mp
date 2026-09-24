import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TabBar } from './TabBar'

const meta = {
  title: 'Components/TabBar',
  component: TabBar,
  args: {
    screen: 'grid',
    onSelect: fn(),
  },
} satisfies Meta<typeof TabBar>

export default meta

type Story = StoryObj<typeof meta>

export const Table: Story = {}

export const Cards: Story = {
  args: { screen: 'cards' },
}

export const Settings: Story = {
  args: { screen: 'settings' },
}

export const UpdateBadge: Story = {
  args: { badge: 'settings' },
}
