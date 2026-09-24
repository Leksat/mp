export const VERDICT_PLACEMENTS = ['top', 'bottom'] as const

export type VerdictPlacement = (typeof VERDICT_PLACEMENTS)[number]

export const MIN_SESSION_LENGTH = 1

export const MIN_REVEAL_DELAY_SECONDS = 1

export interface Settings {
  readonly verdictPlacement: VerdictPlacement
  readonly sessionLength: number
  readonly revealDelaySeconds: number
}

export const defaultSettings = (): Settings => ({
  verdictPlacement: 'bottom',
  sessionLength: 20,
  revealDelaySeconds: 3,
})

export const isVerdictPlacement = (value: unknown): value is VerdictPlacement =>
  VERDICT_PLACEMENTS.includes(value as VerdictPlacement)

const toIntegerAtLeast = (value: unknown, min: number, fallback: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min ? value : fallback

export const toSessionLength = (value: unknown): number =>
  toIntegerAtLeast(value, MIN_SESSION_LENGTH, defaultSettings().sessionLength)

export const toRevealDelaySeconds = (value: unknown): number =>
  toIntegerAtLeast(value, MIN_REVEAL_DELAY_SECONDS, defaultSettings().revealDelaySeconds)
