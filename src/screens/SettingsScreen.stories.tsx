import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { defaultSettings } from '../domain/settings'
import { AppFrame } from '../stories/AppFrame'
import { SettingsScreen } from './SettingsScreen'

const meta = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
  decorators: [
    (Story) => (
      <AppFrame screen="settings">
        <Story />
      </AppFrame>
    ),
  ],
  args: {
    settings: defaultSettings(),
    updateReady: false,
    onChange: fn(),
    onClearProgress: fn(),
    onUpdate: fn(),
  },
} satisfies Meta<typeof SettingsScreen>

export default meta

type Story = StoryObj<typeof meta>

export const Defaults: Story = {}

export const AtMinimums: Story = {
  args: {
    settings: { verdictPlacement: 'top', sessionLength: 1, revealDelaySeconds: 1 },
  },
}

export const UpdateReady: Story = {
  args: { updateReady: true },
}

export const ConfirmingClear: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'clear progress' }))
  },
}
