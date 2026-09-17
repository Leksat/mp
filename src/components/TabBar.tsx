import type { ComponentType } from 'react'
import { CardIcon, GearIcon, GridIcon } from './icons'

export type Screen = 'cards' | 'grid' | 'settings'

interface Tab {
  readonly screen: Screen
  readonly label: string
  readonly Icon: ComponentType<{ readonly size?: number }>
}

const TABS: readonly Tab[] = [
  { screen: 'cards', label: 'cards', Icon: CardIcon },
  { screen: 'grid', label: 'table', Icon: GridIcon },
  { screen: 'settings', label: 'settings', Icon: GearIcon },
]

interface TabBarProps {
  readonly screen: Screen
  onSelect(screen: Screen): void
}

export const TabBar = ({ screen, onSelect }: TabBarProps) => (
  <nav className="tabbar">
    {TABS.map(({ screen: target, label, Icon }) => (
      <button
        key={target}
        type="button"
        className={`tab ${screen === target ? 'active' : ''}`}
        onClick={() => onSelect(target)}
        aria-label={label}
      >
        <Icon size={26} />
      </button>
    ))}
  </nav>
)
