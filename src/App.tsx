import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Confetti } from './components/Confetti'
import { Firework } from './components/Firework'
import { RotateIcon } from './components/icons'
import { TabBar, type Screen } from './components/TabBar'
import { ALL_FACTS, type Fact } from './domain/facts'
import { emptyProgress, forgetFact, learnedCount, withCelebrated } from './domain/progress'
import { loadProgress, loadSettings, saveProgress, saveSettings } from './domain/storage'
import { installUpdate, isStandalone, useUpdateReady } from './pwa'
import { CardScreen } from './screens/CardScreen'
import { GridScreen } from './screens/GridScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useDrill } from './useDrill'
import { useJustOpened } from './useJustOpened'

const InstallBanner = lazy(() => import('./components/InstallBanner'))

export const App = () => {
  const [progress, setProgress] = useState(loadProgress)
  const [settings, setSettings] = useState(loadSettings)
  const [screen, setScreen] = useState<Screen>('grid')
  const [firework, setFirework] = useState(0)
  const showProgress = useCallback(() => {
    setScreen('grid')
    setFirework((round) => round + 1)
  }, [])
  const drill = useDrill(progress, setProgress, settings.sessionLength, showProgress)
  const updateReady = useUpdateReady()
  const justOpened = useJustOpened()

  useEffect(() => saveProgress(progress), [progress])
  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    if (updateReady && justOpened) installUpdate()
  }, [updateReady, justOpened])

  const tableFinished = learnedCount(progress) === ALL_FACTS.length
  const celebrating = !progress.celebrated && tableFinished
  const stopCelebrating = useCallback(() => setProgress(withCelebrated), [])
  const onForget = (fact: Fact) => setProgress((current) => forgetFact(current, fact))
  const onClearProgress = () => setProgress(emptyProgress())

  return (
    <div className="app">
      {!isStandalone && (
        <Suspense>
          <InstallBanner />
        </Suspense>
      )}
      <main className="screen">
        {screen === 'cards' && (
          <CardScreen drill={drill} verdictPlacement={settings.verdictPlacement} />
        )}
        {screen === 'grid' && <GridScreen progress={progress} onForget={onForget} />}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            updateReady={updateReady}
            onChange={setSettings}
            onClearProgress={onClearProgress}
            onUpdate={installUpdate}
          />
        )}
      </main>
      <TabBar
        screen={screen}
        badge={updateReady ? 'settings' : undefined}
        onSelect={setScreen}
      />
      {firework > 0 && (
        <Firework key={firework} bursts={tableFinished ? 3 : 1} onDone={() => setFirework(0)} />
      )}
      {celebrating && <Confetti onDone={stopCelebrating} />}
      <div className="rotate-hint" aria-label="rotate to portrait">
        <RotateIcon size={72} />
      </div>
    </div>
  )
}
