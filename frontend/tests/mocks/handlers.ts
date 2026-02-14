import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8000'

export const handlers = [
  // Auth endpoints
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      created_at: '2025-01-01T00:00:00Z',
      is_active: true,
    })
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'bearer',
    })
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      email: body.email,
      username: body.username,
      first_name: body.first_name,
      last_name: body.last_name,
      created_at: new Date().toISOString(),
      is_active: true,
    })
  }),

  // Portfolio endpoints
  http.get(`${API_URL}/portfolio/summary`, () => {
    return HttpResponse.json({
      portfolio_value: 105000.00,
      positions_value: 55000.00,
      cash_balance: 50000.00,
      positions_count: 3,
      activity_count: 10,
      positions: [
        {
          symbol: 'AAPL',
          company_name: 'Apple Inc.',
          shares: 100,
          current_price: 150.00,
          average_price: 140.00,
          current_value: 15000.00,
        },
        {
          symbol: 'TSLA',
          company_name: 'Tesla, Inc.',
          shares: 50,
          current_price: 200.00,
          average_price: 180.00,
          current_value: 10000.00,
        },
        {
          symbol: 'NVDA',
          company_name: 'NVIDIA Corporation',
          shares: 200,
          current_price: 150.00,
          average_price: 120.00,
          current_value: 30000.00,
        },
      ],
    })
  }),

  http.post(`${API_URL}/portfolio/snapshot`, () => {
    return HttpResponse.json(
      { message: 'Portfolio snapshot created successfully' },
      { status: 201 }
    )
  }),

  // Trading endpoints
  http.get(`${API_URL}/trading/activities`, () => {
    return HttpResponse.json([
      {
        id: 1,
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 50,
        price: 140.00,
        total_amount: 7000.00,
        created_at: '2025-01-15T10:30:00Z',
      },
      {
        id: 2,
        symbol: 'TSLA',
        action: 'BUY',
        quantity: 25,
        price: 180.00,
        total_amount: 4500.00,
        created_at: '2025-01-14T14:20:00Z',
      },
      {
        id: 3,
        symbol: 'AAPL',
        action: 'SELL',
        quantity: 25,
        price: 145.00,
        total_amount: 3625.00,
        created_at: '2025-01-13T09:15:00Z',
      },
    ])
  }),

  http.post(`${API_URL}/trading/orders`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      {
        id: 100,
        symbol: body.symbol,
        action: body.action,
        quantity: body.quantity,
        price: body.price,
        total_amount: body.quantity * body.price,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.get(`${API_URL}/trading/watchlist`, () => {
    return HttpResponse.json([
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.00,
        change: 2.50,
        change_percent: 1.69,
        added_at: '2025-01-10T00:00:00Z',
      },
      {
        id: 2,
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        price: 200.00,
        change: -5.00,
        change_percent: -2.44,
        added_at: '2025-01-09T00:00:00Z',
      },
    ])
  }),

  http.post(`${API_URL}/trading/watchlist`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      {
        id: 3,
        symbol: body.symbol,
        added_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.delete(`${API_URL}/trading/watchlist/:symbol`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Stocks endpoints
  http.get(`${API_URL}/stocks/search`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')

    return HttpResponse.json([
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'Stock',
        exchange: 'NASDAQ',
      },
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        type: 'Stock',
        exchange: 'NASDAQ',
      },
    ])
  }),

  http.get(`${API_URL}/stocks/:symbol`, ({ params }) => {
    const { symbol } = params
    return HttpResponse.json({
      symbol,
      name: `${symbol} Company`,
      price: 150.00,
      change: 2.50,
      change_percent: 1.69,
      volume: 50000000,
      market_cap: 2500000000000,
    })
  }),

  http.get(`${API_URL}/stocks/market/overview`, () => {
    return HttpResponse.json({
      indices: [
        {
          symbol: 'SPY',
          ticker: 'S&P 500',
          value: 4500.00,
          change: 15.50,
          percent: 0.35,
        },
        {
          symbol: 'QQQ',
          ticker: 'NASDAQ',
          value: 380.00,
          change: -2.30,
          percent: -0.60,
        },
      ],
      movers: {
        gainers: [
          {
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            price: 500.00,
            change: 25.00,
            change_percent: 5.26,
          },
        ],
        losers: [
          {
            symbol: 'INTC',
            name: 'Intel Corporation',
            price: 30.00,
            change: -2.00,
            change_percent: -6.25,
          },
        ],
      },
    })
  }),

  // Leaderboard endpoints
  http.get(`${API_URL}/portfolio/leaderboard`, ({ request }) => {
    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || 'all_time'

    return HttpResponse.json([
      {
        rank: 1,
        username: 'trader1',
        portfolio_value: 150000.00,
        return_amount: 50000.00,
        return_percent: 50.00,
      },
      {
        rank: 2,
        username: 'trader2',
        portfolio_value: 125000.00,
        return_amount: 25000.00,
        return_percent: 25.00,
      },
      {
        rank: 3,
        username: 'testuser',
        portfolio_value: 105000.00,
        return_amount: 5000.00,
        return_percent: 5.00,
      },
    ])
  }),

  // User profile endpoints
  http.get(`${API_URL}/auth/users/:username`, ({ params }) => {
    const { username } = params
    return HttpResponse.json({
      username,
      first_name: 'John',
      last_name: 'Doe',
      created_at: '2024-12-01T00:00:00Z',
      portfolio_value: 125000.00,
      rank: 2,
    })
  }),

  http.put(`${API_URL}/auth/profile`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      username: body.username || 'testuser',
      first_name: body.first_name || 'Test',
      last_name: body.last_name || 'User',
      created_at: '2025-01-01T00:00:00Z',
      is_active: true,
    })
  }),

  http.put(`${API_URL}/auth/password`, () => {
    return HttpResponse.json({ message: 'Password updated successfully' })
  }),

  http.delete(`${API_URL}/auth/account`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Bug report endpoint
  http.post(`${API_URL}/bugs`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      {
        id: 1,
        title: body.title,
        description: body.description,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),
]
