import { CardIcon, GridIcon } from './icons'

export type Screen = 'cards' | 'grid'

interface TabBarProps {
  readonly screen: Screen
  onSelect(screen: Screen): void
}

export const TabBar = ({ screen, onSelect }: TabBarProps) => (
  <nav className="tabbar">
    <button
      type="button"
      className={`tab ${screen === 'cards' ? 'active' : ''}`}
      onClick={() => onSelect('cards')}
      aria-label="cards"
    >
      <CardIcon size={26} />
    </button>
    <button
      type="button"
      className={`tab ${screen === 'grid' ? 'active' : ''}`}
      onClick={() => onSelect('grid')}
      aria-label="table"
    >
      <GridIcon size={26} />
    </button>
  </nav>
)
