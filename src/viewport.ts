const SETTLE_DELAY_MS = 350

const applySize = (): void => {
  const viewport = window.visualViewport
  const width = viewport?.width ?? window.innerWidth
  const height = viewport?.height ?? window.innerHeight
  const { style } = document.documentElement

  style.setProperty('--viewport-width', `${width}px`)
  style.setProperty('--viewport-height', `${height}px`)
}

export const trackViewport = (): void => {
  applySize()

  window.visualViewport?.addEventListener('resize', applySize)
  window.addEventListener('resize', applySize)
  window.addEventListener('orientationchange', () => {
    applySize()
    setTimeout(applySize, SETTLE_DELAY_MS)
  })
}
