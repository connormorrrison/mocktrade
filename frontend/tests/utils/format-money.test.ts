import { describe, it, expect } from 'vitest'
import { formatMoney } from '@/lib/formatMoney'

describe('formatMoney', () => {
  it('should format positive numbers as USD currency', () => {
    expect(formatMoney(1000)).toBe('$1,000.00')
    expect(formatMoney(1234.56)).toBe('$1,234.56')
    expect(formatMoney(0.99)).toBe('$0.99')
  })

  it('should format zero correctly', () => {
    expect(formatMoney(0)).toBe('$0.00')
  })

  it('should format negative numbers with minus sign', () => {
    expect(formatMoney(-500)).toBe('-$500.00')
    expect(formatMoney(-1234.56)).toBe('-$1,234.56')
  })

  it('should format large numbers with thousand separators', () => {
    expect(formatMoney(1000000)).toBe('$1,000,000.00')
    expect(formatMoney(123456789.12)).toBe('$123,456,789.12')
  })

  it('should round to two decimal places', () => {
    expect(formatMoney(10.123)).toBe('$10.12')
    expect(formatMoney(10.125)).toBe('$10.13') // Rounds up
    expect(formatMoney(10.999)).toBe('$11.00')
  })

  it('should handle very small positive numbers', () => {
    expect(formatMoney(0.01)).toBe('$0.01')
    expect(formatMoney(0.001)).toBe('$0.00') // Rounds down
  })

  it('should handle decimal numbers without thousand separators correctly', () => {
    expect(formatMoney(999.99)).toBe('$999.99')
    expect(formatMoney(100.5)).toBe('$100.50')
  })

  it('should handle portfolio-relevant values', () => {
    // Typical portfolio values
    expect(formatMoney(50000)).toBe('$50,000.00')
    expect(formatMoney(105000.50)).toBe('$105,000.50')
    expect(formatMoney(1500000)).toBe('$1,500,000.00')
  })

  it('should handle stock price values', () => {
    // Typical stock prices
    expect(formatMoney(150.25)).toBe('$150.25')
    expect(formatMoney(0.50)).toBe('$0.50') // Penny stock
    expect(formatMoney(1234.567)).toBe('$1,234.57')
  })
})
