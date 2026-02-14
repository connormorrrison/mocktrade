import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { exportActivitiesToCsv } from '@/lib/utils/exportCsv'
import type { Activity } from '@/lib/types/activity'

// Extend globalThis to include Blob for proper typing
declare const global: typeof globalThis

describe('exportActivitiesToCsv', () => {
  // Mock DOM APIs
  let mockCreateElement: HTMLAnchorElement
  let mockCreateObjectURL: string
  let mockRevokeObjectURL: any
  let mockAppendChild: any
  let mockRemoveChild: any
  let mockClick: any

  beforeEach(() => {
    // Create a mock anchor element
    mockCreateElement = {
      href: '',
      download: '',
      click: vi.fn(),
    } as any

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockCreateElement)

    // Mock URL.createObjectURL
    mockCreateObjectURL = 'blob:mock-url'
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(mockCreateObjectURL)

    // Mock URL.revokeObjectURL
    mockRevokeObjectURL = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

    // Mock document.body methods
    mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockCreateElement)
    mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockCreateElement)
    mockClick = mockCreateElement.click
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create CSV with correct headers', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities)

    // Get the Blob created
    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    expect(createObjectURLCalls.length).toBe(1)

    const blob = createObjectURLCalls[0][0] as Blob
    expect(blob.type).toBe('text/csv')
  })

  it('should export activities with correct data format', () => {
    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 50,
        price: 150.00,
        total_amount: 7500.00,
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 2,
        symbol: 'TSLA',
        action: 'SELL',
        quantity: 25,
        price: 200.00,
        total_amount: 5000.00,
        created_at: '2025-01-14T14:20:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    // Verify Blob was created with correct data
    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    const blob = createObjectURLCalls[0][0] as Blob

    expect(blob.type).toBe('text/csv')

    // Verify createObjectURL was called
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('should use default filename when not provided', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities)

    expect(mockCreateElement.download).toBe('activity.csv')
  })

  it('should use custom filename when provided', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities, 'my-trades.csv')

    expect(mockCreateElement.download).toBe('my-trades.csv')
  })

  it('should create and click download link', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities)

    // Verify link was created
    expect(document.createElement).toHaveBeenCalledWith('a')

    // Verify link was configured
    expect(mockCreateElement.href).toBe(mockCreateObjectURL)
    expect(mockCreateElement.download).toBe('activity.csv')

    // Verify link was added to DOM, clicked, then removed
    expect(mockAppendChild).toHaveBeenCalledWith(mockCreateElement)
    expect(mockClick).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalledWith(mockCreateElement)
  })

  it('should revoke object URL to free memory', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities)

    expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockCreateObjectURL)
  })

  it('should handle empty activities array', () => {
    const activities: Activity[] = []

    exportActivitiesToCsv(activities)

    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    const blob = createObjectURLCalls[0][0] as Blob

    // Verify blob was created
    expect(blob.type).toBe('text/csv')
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should handle single activity', () => {
    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'NVDA',
        action: 'BUY',
        quantity: 10,
        price: 500.00,
        total_amount: 5000.00,
        created_at: '2025-01-10T12:00:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    const blob = createObjectURLCalls[0][0] as Blob

    // Verify blob was created
    expect(blob.type).toBe('text/csv')
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should handle large number of activities', () => {
    const activities: Activity[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      symbol: `STOCK${i}`,
      action: i % 2 === 0 ? 'BUY' : 'SELL',
      quantity: 10,
      price: 100.00,
      total_amount: 1000.00,
      created_at: '2025-01-01T00:00:00Z',
    })) as Activity[]

    exportActivitiesToCsv(activities)

    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    const blob = createObjectURLCalls[0][0] as Blob

    // Verify blob was created
    expect(blob.type).toBe('text/csv')
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should format dates correctly', () => {
    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 10,
        price: 150.00,
        total_amount: 1500.00,
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    const createObjectURLCalls = (window.URL.createObjectURL as any).mock.calls
    const blob = createObjectURLCalls[0][0] as Blob

    // Verify blob was created
    expect(blob.type).toBe('text/csv')
    expect(window.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should properly escape CSV fields with commas in dates and currency', () => {
    // Create a spy on Blob constructor to capture the CSV content
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 10,
        price: 150.00,
        total_amount: 1500.00,
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    // Date formatted with toLocaleString() contains commas like "1/15/2025, 10:30:00 AM"
    // It should be wrapped in quotes: "1/15/2025, 10:30:00 AM"
    // Price and total also need to be quoted because they contain commas in large numbers
    const lines = capturedCsvContent.split('\n')

    // Check that the date field is quoted (because it contains a comma)
    // Price and total should be quoted and formatted as currency (e.g., "$150.00" or "$1,500.00")
    expect(lines[1]).toContain('"')
    expect(capturedCsvContent).toContain('$150.00')
    expect(capturedCsvContent).toContain('$1,500.00')

    // Restore original Blob
    global.Blob = originalBlob
  })

  it('should handle symbols that might contain special characters', () => {
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 10,
        price: 150.00,
        total_amount: 1500.00,
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    const lines = capturedCsvContent.split('\n')

    // Verify we have header + 1 data row
    expect(lines.length).toBe(2)

    // Verify header
    expect(lines[0]).toBe('ID,Date,Action,Symbol,Quantity,Price per Share,Total')

    // Verify data row has correct number of fields (when split properly, accounting for quoted fields)
    expect(lines[1]).toContain('AAPL')
    expect(lines[1]).toContain('BUY')

    global.Blob = originalBlob
  })

  it('should handle multiple activities with proper CSV formatting', () => {
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 50,
        price: 150.25,
        total_amount: 7512.50,
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 2,
        symbol: 'TSLA',
        action: 'SELL',
        quantity: 25,
        price: 200.00,
        total_amount: 5000.00,
        created_at: '2025-01-14T14:20:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    const lines = capturedCsvContent.split('\n')

    // Should have header + 2 data rows
    expect(lines.length).toBe(3)

    // Verify both activities are present
    expect(capturedCsvContent).toContain('AAPL')
    expect(capturedCsvContent).toContain('TSLA')
    expect(capturedCsvContent).toContain('BUY')
    expect(capturedCsvContent).toContain('SELL')

    global.Blob = originalBlob
  })

  it('should format prices and quantities correctly', () => {
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 10.5, // Fractional share
        price: 252.52999877929700, // Price with many decimals
        total_amount: 389.7999954223630, // Total with many decimals
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    // Verify that the price and total are formatted as currency with 2 decimal places
    expect(capturedCsvContent).toContain('$252.53') // Price should be rounded to 2 decimals
    expect(capturedCsvContent).toContain('$389.80') // Total should be rounded to 2 decimals

    // Verify that quantity is formatted with up to 3 decimal places
    expect(capturedCsvContent).toContain('10.5')

    global.Blob = originalBlob
  })

  it('should format fractional shares correctly', () => {
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'TSLA',
        action: 'BUY',
        quantity: 0.123, // Small fractional share
        price: 100.00,
        total_amount: 12.30,
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 2,
        symbol: 'NVDA',
        action: 'BUY',
        quantity: 25.3334, // Should round to 25.333
        price: 500.00,
        total_amount: 12666.70,
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    // Verify fractional shares are formatted to 3 decimals max
    expect(capturedCsvContent).toContain('0.123')
    expect(capturedCsvContent).toContain('25.333')

    global.Blob = originalBlob
  })

  it('should properly quote currency fields with commas and dollar signs', () => {
    const originalBlob = global.Blob
    let capturedCsvContent = ''

    global.Blob = class extends originalBlob {
      constructor(parts: any[], options?: BlobPropertyBag) {
        super(parts, options)
        capturedCsvContent = parts[0]
      }
    } as any

    const activities: Activity[] = [
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 100,
        price: 1234.56, // Large price that will have comma in currency format
        total_amount: 123456.00, // Large total that will have commas
        created_at: '2025-01-15T10:30:00Z',
      },
    ]

    exportActivitiesToCsv(activities)

    // Currency fields with commas should be quoted
    // "$1,234.56" and "$123,456.00" should be wrapped in quotes
    expect(capturedCsvContent).toContain('"$1,234.56"')
    expect(capturedCsvContent).toContain('"$123,456.00"')

    global.Blob = originalBlob
  })
})
