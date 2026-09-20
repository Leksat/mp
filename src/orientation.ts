const applyAngle = (): void => {
  document.documentElement.dataset.angle = String(screen.orientation?.angle ?? 0)
}

export const holdPortrait = (): void => {
  void screen.orientation?.lock?.('portrait').catch(() => {})
  applyAngle()
  screen.orientation?.addEventListener('change', applyAngle)
}
