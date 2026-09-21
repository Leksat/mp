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

export const parseFactKey = (key: string): Fact | undefined => {
  const [left, right] = key.split('x').map(Number)
  return FACTORS.includes(left) && FACTORS.includes(right) ? { left, right } : undefined
}

export const product = ({ left, right }: Fact): number => left * right

export const twin = ({ left, right }: Fact): Fact => ({ left: right, right: left })

export const isTie = ({ left, right }: Fact): boolean => left === right

const RULE_FACTORS = [1, 10]
const PATTERN_FACTORS = [2, 5, 9]

const HARD_PAIRS = [
  [3, 7],
  [3, 8],
  [4, 6],
  [4, 7],
  [4, 8],
  [6, 7],
  [6, 8],
  [7, 8],
]

const HARD_KEYS = new Set(
  HARD_PAIRS.flatMap(([left, right]) => [factKey({ left, right }), factKey({ left: right, right: left })]),
)

const hasFactorIn = ({ left, right }: Fact, factors: readonly number[]): boolean =>
  factors.includes(left) || factors.includes(right)

const REQUIRED_RULE = 1
const REQUIRED_PATTERNED = 2
const REQUIRED_PLAIN = 3
const REQUIRED_HARD = 5

export const baseRequiredStreak = (fact: Fact): number => {
  if (hasFactorIn(fact, RULE_FACTORS)) return REQUIRED_RULE
  if (isTie(fact) || hasFactorIn(fact, PATTERN_FACTORS)) return REQUIRED_PATTERNED
  return HARD_KEYS.has(factKey(fact)) ? REQUIRED_HARD : REQUIRED_PLAIN
}

export const INTRODUCTION_ORDER: readonly Fact[] = [...ALL_FACTS].sort(
  (one, other) => baseRequiredStreak(one) - baseRequiredStreak(other) || product(one) - product(other),
)

const NEAR_PRODUCT = 2

const sharesFactor = (one: Fact, other: Fact): boolean =>
  one.left === other.left ||
  one.left === other.right ||
  one.right === other.left ||
  one.right === other.right

export const areConfusable = (one: Fact, other: Fact): boolean =>
  sharesFactor(one, other) || Math.abs(product(one) - product(other)) <= NEAR_PRODUCT
