import type { Preview } from '@storybook/react-vite'
import { sb } from 'storybook/test'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import '../src/index.css'
import { trackViewport } from '../src/viewport'

sb.mock(import('../src/pwa.ts'))

trackViewport()

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    viewport: { options: INITIAL_VIEWPORTS },
  },
  initialGlobals: {
    viewport: { value: 'iphone14', isRotated: false },
  },
}

export default preview
