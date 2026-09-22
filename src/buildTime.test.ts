import { describe, expect, it } from 'vitest'
import { formatBuildTime } from './buildTime'

describe('the build time', () => {
  it('shows the phone clock, not UTC', () => {
    const builtAt = '2026-09-21T21:36:00.000Z'
    const local = new Date(builtAt)
    const expected = [
      local.getFullYear(),
      String(local.getMonth() + 1).padStart(2, '0'),
      String(local.getDate()).padStart(2, '0'),
    ].join('-')

    expect(formatBuildTime(builtAt)).toBe(
      `${expected} ${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`,
    )
  })

  it('reads as a date and time down to the minute', () => {
    expect(formatBuildTime('2026-09-21T21:36:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('shifts an evening UTC build into the next day in Amsterdam', () => {
    expect(formatBuildTime('2026-09-21T23:30:00.000Z')).toBe('2026-09-22 01:30')
  })
})
