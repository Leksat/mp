import { useCallback, useEffect, useState } from 'react'
import { Confetti } from './components/Confetti'
import { TabBar, type Screen } from './components/TabBar'
import { ALL_FACTS, type Fact } from './domain/facts'
import { forgetFact, learnedCount, withCelebrated } from './domain/progress'
import { loadProgress, saveProgress } from './domain/storage'
import { CardScreen } from './screens/CardScreen'
import { GridScreen } from './screens/GridScreen'
import { useDrill } from './useDrill'

export const App = () => {
  const [progress, setProgress] = useState(loadProgress)
  const [screen, setScreen] = useState<Screen>('cards')
  const drill = useDrill(progress, setProgress)

  useEffect(() => saveProgress(progress), [progress])

  const celebrating = !progress.celebrated && learnedCount(progress) === ALL_FACTS.length
  const stopCelebrating = useCallback(() => setProgress(withCelebrated), [])
  const onForget = (fact: Fact) => setProgress((current) => forgetFact(current, fact))

  return (
    <div className="app">
      <main className="screen">
        {screen === 'cards' ? (
          <CardScreen drill={drill} />
        ) : (
          <GridScreen progress={progress} onForget={onForget} />
        )}
      </main>
      <TabBar screen={screen} onSelect={setScreen} />
      {celebrating && <Confetti onDone={stopCelebrating} />}
    </div>
  )
}
