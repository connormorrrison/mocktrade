# MockTrade

**MockTrade** is a full-stack trading simulator that allows users to **practice trading stocks in a risk-free environment**. Users can search for stocks, execute buy/sell trades, view their portfolio performance, and track their transaction history.

**Live at:** [mocktrade.ca](https://mocktrade.ca)

## Features
- **User Authentication:** Register and log in securely.
- **Stock Search:** Find real-time stock prices.
- **Portfolio Management:** Track holdings, cash balance, and overall portfolio performance.
- **Trade Execution:** Buy and sell stocks using virtual cash.
- **Transaction History:** View and filter past trades.
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

- **Try it live:** [mocktrade.ca](https://mocktrade.ca)
- **Run locally:** 
  - Backend: See `backend/README.md`
  - Frontend: See `frontend/README.md`
- **Full setup guide:** [Developer Guide](./DEVELOPER_SETUP.md)
