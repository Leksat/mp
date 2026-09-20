export const lockPortrait = (): void => {
  void screen.orientation?.lock?.('portrait').catch(() => {})
}
