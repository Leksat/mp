import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { App } from './App'
import { emptyProgress, type Progress } from './domain/progress'
import { defaultSettings, type Settings } from './domain/settings'
import { saveProgress, saveSettings } from './domain/storage'
import { useUpdateReady } from './pwa'
import {
  completeProgress,
  midwayProgress,
  oneFactLeftProgress,
  rampedProgress,
} from './stories/progress'

const seed = (progress: Progress, settings: Settings) => () => {
  saveProgress(progress)
  saveSettings(settings)
}

const meta = {
  title: 'App',
  component: App,
  beforeEach: () => {
    mocked(useUpdateReady).mockReturnValue(false)
  },
} satisfies Meta<typeof App>

export default meta

type Story = StoryObj<typeof meta>

const openCards: Story['play'] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'cards' }))
}

export const FirstLaunch: Story = {
  beforeEach: seed(emptyProgress(), defaultSettings()),
}

export const Midway: Story = {
  beforeEach: seed(midwayProgress, defaultSettings()),
}

export const MidwayCards: Story = {
  beforeEach: seed(midwayProgress, defaultSettings()),
  play: openCards,
}

export const EveryStreakColour: Story = {
  beforeEach: seed(rampedProgress(), defaultSettings()),
}

export const OneFactLeft: Story = {
  beforeEach: seed(oneFactLeftProgress, defaultSettings()),
  play: openCards,
}

export const Complete: Story = {
  beforeEach: seed(completeProgress, defaultSettings()),
}

export const ButtonsOnTop: Story = {
  beforeEach: seed(midwayProgress, { ...defaultSettings(), verdictPlacement: 'top' }),
  play: openCards,
}

export const UpdateReady: Story = {
  beforeEach: () => {
    seed(midwayProgress, defaultSettings())()
    mocked(useUpdateReady).mockReturnValue(true)
  },
}
