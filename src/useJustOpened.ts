import { useEffect, useState } from 'react'

export const useJustOpened = () => {
  const [justOpened, setJustOpened] = useState(true)

  useEffect(() => {
    const settle = () => setJustOpened(false)

    document.addEventListener('pointerdown', settle)
    document.addEventListener('visibilitychange', settle)

    return () => {
      document.removeEventListener('pointerdown', settle)
      document.removeEventListener('visibilitychange', settle)
    }
  }, [])

  return justOpened
}
