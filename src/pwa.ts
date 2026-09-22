import { useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

export const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

let updateReady = false
const listeners = new Set<() => void>()

const applyUpdate = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateReady = true
    listeners.forEach((listener) => listener())
  },
  onRegisteredSW(_scriptUrl, registration) {
    if (!registration) return

    const check = () => {
      if (document.visibilityState === 'visible') void registration.update()
    }

    setInterval(check, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', check)
  },
})

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useUpdateReady = () => useSyncExternalStore(subscribe, () => updateReady)

export const installUpdate = () => {
  void applyUpdate(true)
}
