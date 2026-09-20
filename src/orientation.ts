export const holdPortrait = (): void => {
  void screen.orientation?.lock?.('portrait').catch(() => {})
}
