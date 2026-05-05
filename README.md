# MockTrade

**MockTrade** is a full-stack trading simulator that allows users to **practice trading stocks in a risk-free environment**. Users start with $100,000 in virtual cash, trade real stocks at live market prices, and compete on a leaderboard.

**Live at:** [mocktrade.ca](https://mocktrade.ca)

## Features
- **User Authentication:** Register, log in, or sign in with Google.
- **Stock Search:** Find real-time stock prices and view price history charts.
- **Portfolio Management:** Track holdings, cash balance, and overall portfolio performance with interactive charts.
- **Trade Execution:** Buy and sell stocks using virtual cash at live market prices.
- **Leaderboard:** Compete with other users across Day, Week, Month, and All-Time timeframes ranked by profit and return.
- **Activity History:** View and filter past trades.
- **Market Indices Dashboard:** Monitor key market indices such as DJIA, S&P 500, and Nasdaq.
- **Watchlist:** Save stocks to a personal watchlist for quick access.

## Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS, Recharts
- **Backend:** FastAPI, Python, PostgreSQL
- **Authentication:** JWT + Google OAuth
- **Market Data:** Yahoo Finance API (yfinance)
- **Hosting:** Vercel (frontend), Render (backend), Supabase (database)

## Project Structure

```
mocktrade/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── core/           # Config, security, scheduler, middleware
│   │   ├── domains/        # Auth, portfolio, trading, stocks
│   │   └── infrastructure/ # Database setup
│   └── tests/
├── frontend/         # React TypeScript frontend
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Route pages
│       ├── lib/            # Hooks, types, utilities
│       └── contexts/       # React contexts
├── setup.sh          # One-command local setup script
└── README.md
```

## Getting Started

**Try it live:** [mocktrade.ca](https://mocktrade.ca)

### Local Development

#### Prerequisites
- Git
- Node.js (v18+)
- Python 3.10+

#### Quick Start

The setup script handles everything (venv, dependencies, and starts both servers):

```bash
git clone https://github.com/connormorrrison/mocktrade.git
cd mocktrade/
```

Create a `.env` file in the `backend/` directory:
```
DATABASE_URL=sqlite:///./development.db
SECRET_KEY=your-secret-key-here
```

Then run:
```bash
./setup.sh
```

This starts the backend on `http://localhost:8000` and frontend on `http://localhost:5173`. Press Ctrl+C to stop both.

#### Manual Setup

1. **Backend:**
   ```bash
   cd backend/
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend/
   npm install
   npm run dev
   ```

The database tables are created automatically when the backend starts. SQLite is used by default for local development; set `DATABASE_URL` to a PostgreSQL connection string for production.
