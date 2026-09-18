import { useEffect, useState } from 'react'

export const useJustOpened = () => {
  const [justOpened, setJustOpened] = useState(true)

  useEffect(() => {
    const onTouch = () => setJustOpened(false)
    const onVisibility = () => setJustOpened(document.visibilityState === 'visible')

    document.addEventListener('pointerdown', onTouch)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('pointerdown', onTouch)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return justOpened
}
