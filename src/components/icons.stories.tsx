import type { Meta, StoryObj } from '@storybook/react-vite'
import * as icons from './icons'

const IconGallery = ({ size }: { readonly size: number }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
      gap: 24,
      padding: 24,
    }}
  >
    {Object.entries(icons).map(([name, Icon]) => (
      <div
        key={name}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <Icon size={size} />
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{name}</span>
      </div>
    ))}
  </div>
)

const meta = {
  title: 'Components/Icons',
  component: IconGallery,
  args: { size: 32 },
} satisfies Meta<typeof IconGallery>

export default meta

type Story = StoryObj<typeof meta>

export const Gallery: Story = {}
