export const VERDICT_PLACEMENTS = ['top', 'bottom'] as const

export type VerdictPlacement = (typeof VERDICT_PLACEMENTS)[number]

export interface Settings {
  readonly verdictPlacement: VerdictPlacement
}

export const defaultSettings = (): Settings => ({ verdictPlacement: 'bottom' })

export const isVerdictPlacement = (value: unknown): value is VerdictPlacement =>
  VERDICT_PLACEMENTS.includes(value as VerdictPlacement)
