export const MIN_FACTOR = 1
export const MAX_FACTOR = 10

export interface Fact {
  readonly left: number
  readonly right: number
}

export const FACTORS: readonly number[] = Array.from(
  { length: MAX_FACTOR - MIN_FACTOR + 1 },
  (_, offset) => MIN_FACTOR + offset,
)

export const ALL_FACTS: readonly Fact[] = FACTORS.flatMap((left) =>
  FACTORS.map((right) => ({ left, right })),
)

export const factKey = ({ left, right }: Fact): string => `${left}x${right}`

export const toFact = (left: number, right: number): Fact => ({ left, right })

export const product = ({ left, right }: Fact): number => left * right
