import { describe, it, expect } from 'vitest'
import { formatShares } from '@/lib/formatShares'

describe('formatShares', () => {
  it('should format whole numbers without decimals', () => {
    expect(formatShares(100)).toBe('100')
    expect(formatShares(50)).toBe('50')
    expect(formatShares(1)).toBe('1')
  })

  it('should format numbers with one decimal place', () => {
    expect(formatShares(100.5)).toBe('100.5')
    expect(formatShares(50.1)).toBe('50.1')
    expect(formatShares(1.9)).toBe('1.9')
  })

  it('should format numbers with two decimal places', () => {
    expect(formatShares(100.25)).toBe('100.25')
    expect(formatShares(50.75)).toBe('50.75')
    expect(formatShares(1.12)).toBe('1.12')
  })

  it('should format numbers with three decimal places', () => {
    expect(formatShares(100.123)).toBe('100.123')
    expect(formatShares(50.456)).toBe('50.456')
    expect(formatShares(1.789)).toBe('1.789')
  })

  it('should strip trailing zeros after decimal point', () => {
    expect(formatShares(100.100)).toBe('100.1')
    expect(formatShares(50.200)).toBe('50.2')
    expect(formatShares(1.000)).toBe('1')
  })

  it('should handle zero correctly', () => {
    expect(formatShares(0)).toBe('0')
    expect(formatShares(0.000)).toBe('0')
  })

  it('should format fractional shares correctly', () => {
    expect(formatShares(0.5)).toBe('0.5')
    expect(formatShares(0.25)).toBe('0.25')
    expect(formatShares(0.123)).toBe('0.123')
    expect(formatShares(0.001)).toBe('0.001')
  })

  it('should round numbers beyond 3 decimal places', () => {
    expect(formatShares(100.1234)).toBe('100.123')
    expect(formatShares(100.1235)).toBe('100.124') // Rounds up
    expect(formatShares(100.9999)).toBe('101')
  })

  it('should handle very small numbers', () => {
    expect(formatShares(0.001)).toBe('0.001')
    expect(formatShares(0.0001)).toBe('0')
  })

  it('should handle large numbers', () => {
    expect(formatShares(1000)).toBe('1000')
    expect(formatShares(10000.5)).toBe('10000.5')
    expect(formatShares(123456.789)).toBe('123456.789')
  })

  it('should strip decimal point if all trailing digits are zero', () => {
    expect(formatShares(42.000)).toBe('42')
    expect(formatShares(100.0)).toBe('100')
  })

  it('should handle typical stock quantities', () => {
    // Whole shares
    expect(formatShares(100)).toBe('100')
    expect(formatShares(50)).toBe('50')

    // Fractional shares (common with some brokers)
    expect(formatShares(10.5)).toBe('10.5')
    expect(formatShares(25.333)).toBe('25.333')
  })
})
