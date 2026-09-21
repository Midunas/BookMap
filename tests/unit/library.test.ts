import { describe, it, expect } from 'vitest'
import { centuryOf, eraOf, yearLabel } from '~/utils/library'

describe('year helpers', () => {
  it('labels BC and early AD years', () => {
    expect(yearLabel(-500)).toBe('500 BC')
    expect(yearLabel(180)).toBe('AD 180')
    expect(yearLabel(1949)).toBe('1949')
  })
  it('buckets centuries', () => {
    expect(centuryOf(-375)).toBe('4th c. BC')
    expect(centuryOf(1866)).toBe('19th century')
    expect(centuryOf(2004)).toBe('21st century')
  })
  it('buckets eras', () => {
    expect(eraOf(180)).toBe('Antiquity')
    expect(eraOf(1813)).toBe('19th century')
    expect(eraOf(1967)).toBe('1960s')
  })
})
