import { describe, expect, it } from 'vitest'
import { shuffled } from './shuffle'

describe('shuffling', () => {
  it('keeps every item exactly once', () => {
    const items = [1, 2, 3, 4, 5, 6, 7]
    expect([...shuffled(items, Math.random)].sort()).toEqual(items)
  })

  it('leaves the input untouched', () => {
    const items = [1, 2, 3]
    shuffled(items, () => 0)
    expect(items).toEqual([1, 2, 3])
  })

  it('follows the random source', () => {
    expect(shuffled([1, 2, 3], () => 0)).toEqual([2, 3, 1])
    expect(shuffled([1, 2, 3], () => 0.99)).toEqual([1, 2, 3])
  })
})
