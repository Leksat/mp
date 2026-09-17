import { useCallback, useEffect, useState } from 'react'
import { Confetti } from './components/Confetti'
import { TabBar, type Screen } from './components/TabBar'
import { ALL_FACTS, type Fact } from './domain/facts'
import { emptyProgress, forgetFact, learnedCount, withCelebrated } from './domain/progress'
import { loadProgress, loadSettings, saveProgress, saveSettings } from './domain/storage'
import { CardScreen } from './screens/CardScreen'
import { GridScreen } from './screens/GridScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useDrill } from './useDrill'

export const App = () => {
  const [progress, setProgress] = useState(loadProgress)
  const [settings, setSettings] = useState(loadSettings)
  const [screen, setScreen] = useState<Screen>('cards')
  const drill = useDrill(progress, setProgress)

  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => saveSettings(settings), [settings])

  const celebrating = !progress.celebrated && learnedCount(progress) === ALL_FACTS.length
  const stopCelebrating = useCallback(() => setProgress(withCelebrated), [])
  const onForget = (fact: Fact) => setProgress((current) => forgetFact(current, fact))
  const onClearProgress = () => setProgress(emptyProgress())

  return (
    <div className="app">
      <main className="screen">
        {screen === 'cards' && (
          <CardScreen drill={drill} verdictPlacement={settings.verdictPlacement} />
        )}
        {screen === 'grid' && <GridScreen progress={progress} onForget={onForget} />}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            onClearProgress={onClearProgress}
          />
        )}
      </main>
      <TabBar screen={screen} onSelect={setScreen} />
      {celebrating && <Confetti onDone={stopCelebrating} />}
    </div>
  )
}
