import type { ReactNode } from 'react'
import { TabBar, type Screen } from '../components/TabBar'

const stayOnScreen = () => {}

interface AppFrameProps {
  readonly screen: Screen
  readonly children: ReactNode
}

export const AppFrame = ({ screen, children }: AppFrameProps) => (
  <div className="app">
    <main className="screen">{children}</main>
    <TabBar screen={screen} onSelect={stayOnScreen} />
  </div>
)
