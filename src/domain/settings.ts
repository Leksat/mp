export const VERDICT_PLACEMENTS = ['top', 'bottom'] as const

export type VerdictPlacement = (typeof VERDICT_PLACEMENTS)[number]

export const MIN_SESSION_LENGTH = 1

export interface Settings {
  readonly verdictPlacement: VerdictPlacement
  readonly sessionLength: number
}

export const defaultSettings = (): Settings => ({
  verdictPlacement: 'bottom',
  sessionLength: 20,
})

export const isVerdictPlacement = (value: unknown): value is VerdictPlacement =>
  VERDICT_PLACEMENTS.includes(value as VerdictPlacement)

export const toSessionLength = (value: unknown): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= MIN_SESSION_LENGTH
    ? value
    : defaultSettings().sessionLength
