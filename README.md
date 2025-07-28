# MockTrade

**MockTrade** is a full-stack trading simulator that allows users to **practice trading stocks in a risk-free environment**. Users can search for stocks, execute buy/sell trades, view their portfolio performance, and track their activity history.

**Live at:** [mocktrade.ca](https://mocktrade.ca)

## Features
- **User Authentication:** Register and log in securely.
- **Stock Search:** Find real-time stock prices.
- **Portfolio Management:** Track holdings, cash balance, and overall portfolio performance.
- **Trade Execution:** Buy and sell stocks using virtual cash.
- **Activity History:** View and filter past trades.
- **Market Indices Dashboard:** Monitor key market indices such as **DJIA, S&P 500, and Nasdaq**.
- **Data Visualization:** Enjoy portfolio performance charts and detailed stock price histories.

## Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS, Chart.js
- **Backend:** FastAPI, Python, PostgreSQL
- **Authentication:** JWT for authentication
- **Market Data:** Yahoo Finance API (yfinance)

## Project Structure

```
mocktrade/
├── backend/          # FastAPI Python backend
├── frontend/         # React TypeScript frontend
├── assets/          # Shared assets (logos, icons)
└── README.md        # This file
```

## Getting Started

**Try it live:** [mocktrade.ca](https://mocktrade.ca)

### Local Development

#### Prerequisites
- Git
- Node.js (version 14.x or later)
- Python 3.x
- PostgreSQL

#### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/connormorrrison/mocktrade.git
   cd mocktrade/
   ```

2. **Backend Setup:**
   ```bash
   cd backend/
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend/
   npm install
   ```

#### Configuration
1. **Start PostgreSQL:**
   ```bash
   brew services start postgresql@14
   ```

2. **Create database:**
   ```bash
   createdb development
   ```

3. **Create `.env` file in backend directory:**
   ```
   DATABASE_URL=postgresql://your_username@localhost:5432/development
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

#### Running the Application
1. **Start the backend server:**
   ```bash
   cd backend/
   uvicorn app.main:app --reload
   ```

2. **Start the frontend:**
   ```bash
   cd frontend/
   npm run dev
   ```

The database tables will be created automatically when the backend starts.
