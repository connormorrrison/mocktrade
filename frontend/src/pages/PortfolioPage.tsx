// PortfolioPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// 1) Import dayjs to parse your date strings easily:
import dayjs from 'dayjs';

interface PortfolioPosition {
  symbol: string;
  shares: number;
  current_price: number;
  previous_price?: number;
  average_price: number;
  price_at_selected_range?: number;
  created_at: string | null; 
}

// A helper to calculate the earliest date for a chosen range
function getEarliestDateForRange(range: string): Date | null {
  const now = new Date();

  switch (range) {
    case "1mo":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3mo":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6mo":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "max":
    default:
      return null; // No limit
  }
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState('1mo');

  useEffect(() => {
    if (!hasFetched) {
      fetchPortfolioData();
      setHasFetched(true);
    }
  }, [hasFetched]);

  async function fetchPortfolioData() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/trading/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      console.log("API response:", data);

      // 2) Console.log what the server actually returns
      console.log("Positions from server:", data.positions);

      // Make sure 'created_at' is valid or fallback to null
      const validPositions = (data.positions || []).map((position: any) => {
        // Attempt to parse the date with dayjs:
        const parsed = dayjs(position.created_at);
        const isValid = parsed.isValid();

        if (!isValid) {
          console.warn(
            `Invalid created_at for symbol=${position.symbol}, value=${position.created_at}`
          );
        }

        return {
          ...position,
          shares: position.shares || 0,
          current_price: position.current_price || 0,
          previous_price: position.previous_close_price || undefined,
          average_price: position.average_price || 0,
          price_at_selected_range: undefined,
          // If valid, store ISO string; if not, store null
          created_at: isValid ? parsed.toISOString() : null,
        };
      });

      setPositions(validPositions);
      setCashBalance(data.cash_balance || 0);
      setInitialInvestment(data.initial_investment || 100000);
      setError(null);

      fetchHistoricalPrices(selectedRange, validPositions);
    } catch (err) {
      setError('Unable to load portfolio data');
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchHistoricalPrices(range: string, positions: PortfolioPosition[]) {
    try {
      const token = localStorage.getItem('token');
      const updatedPositions = await Promise.all(
        positions.map(async (position) => {
          const response = await fetch(
            `http://localhost:8000/api/v1/stocks/history/${position.symbol}?range=${range}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch historical data for ${position.symbol}`);
            return { ...position, price_at_selected_range: position.average_price };
          }

          const data = await response.json();
          if (data.historical_prices && data.historical_prices.length > 0 && position.created_at) {
            // Only filter if we actually have a valid date
            const createdAtDate = new Date(position.created_at);

            // Sort ascending
            const filteredPrices = data.historical_prices
              .filter((p: any) => new Date(p.date) >= createdAtDate)
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (filteredPrices.length > 0) {
              const oldestPrice = filteredPrices[0].close;
              return { ...position, price_at_selected_range: oldestPrice };
            }
          }

          // Fallback
          return { ...position, price_at_selected_range: position.average_price };
        })
      );

      setPositions(updatedPositions);
    } catch (err) {
      console.error('Error fetching historical prices:', err);
    }
  }

  function handleRangeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRange(event.target.value);
    fetchHistoricalPrices(event.target.value, positions);
  }

  function formatMoney(value: number) {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  const totalPortfolioValue =
    positions.reduce((sum, pos) => sum + pos.shares * pos.current_price, 0) + cashBalance;

  const cumulativeReturn =
    initialInvestment > 0
      ? ((totalPortfolioValue - initialInvestment) / initialInvestment) * 100
      : 0;

  // 3) Get earliest date for the selected range
  const rangeEarliestDate = getEarliestDateForRange(selectedRange);

  return (
    <div className="p-8 w-full mt-8">
      <Card className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {!error && !isLoading && (
            <div className="space-y-6">
              {/* Account Summary */}
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Account Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500">Total Portfolio Value</p>
                    <p className="text-4xl font-semibold">
                      {formatMoney(totalPortfolioValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cash Balance</p>
                    <p className="text-2xl font-semibold">
                      {formatMoney(cashBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cumulative Return</p>
                    <p
                      className={`text-2xl font-semibold ${
                        cumulativeReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {cumulativeReturn >= 0
                        ? `+${cumulativeReturn.toFixed(2)}%`
                        : `${cumulativeReturn.toFixed(2)}%`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dropdown */}
              <div>
                <label className="text-gray-500">Show Gain Since: </label>
                <select
                  className="border p-2 rounded-md"
                  value={selectedRange}
                  onChange={handleRangeChange}
                >
                  <option value="1mo">1 Month</option>
                  <option value="3mo">3 Months</option>
                  <option value="6mo">6 Months</option>
                  <option value="1y">1 Year</option>
                  <option value="max">Max</option>
                </select>
              </div>

              {/* Holdings */}
              <div>
                <h3 className="text-xl font-medium">Holdings</h3>
                {positions.length === 0 ? (
                  <p className="text-gray-500">No positions in portfolio</p>
                ) : (
                  <div className="space-y-6">
                    {positions.map((pos) => {
                      // 4) If created_at is null or invalid, skip the note
                      if (!pos.created_at) {
                        // Force “no note” if date was invalid
                      }

                      const purchaseDate = pos.created_at
                        ? new Date(pos.created_at)
                        : null; // fallback

                      // Compare earliest date for the selected range with the purchase date
                      const usingFullRequestedRange =
                        !rangeEarliestDate ||
                        !purchaseDate ||
                        purchaseDate <= rangeEarliestDate;

                      // Gains
                      const gainSinceRange =
                        (pos.current_price -
                          (pos.price_at_selected_range || pos.average_price)) *
                        pos.shares;
                      const dailyPL = pos.previous_price
                        ? (pos.current_price - pos.previous_price) * pos.shares
                        : 0;

                      return (
                        <div key={pos.symbol} className="p-4 border rounded-lg shadow-md">
                          <div className="flex justify-between items-center">
                            {/* Symbol & Shares */}
                            <div>
                              <p className="text-lg font-semibold">{pos.symbol}</p>
                              <p className="text-gray-500">
                                {pos.shares} {pos.shares === 1 ? 'share' : 'shares'}
                              </p>
                            </div>

                            {/* Current Price */}
                            <div className="text-right">
                              <p className="text-gray-500">Current Price</p>
                              <p className="font-medium">{formatMoney(pos.current_price)}</p>
                            </div>

                            {/* Gain (selected range) */}
                            <div className="text-right">
                              <p className="text-gray-500">Gain ({selectedRange})</p>
                              <p
                                className={`font-medium ${
                                  gainSinceRange >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {gainSinceRange >= 0 ? '+' : ''}
                                {formatMoney(gainSinceRange)}
                              </p>
                            </div>

                            {/* Daily P/L */}
                            <div className="text-right">
                              <p className="text-gray-500">Daily P/L</p>
                              <p
                                className={`font-medium ${
                                  dailyPL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {dailyPL >= 0 ? '+' : ''}
                                {formatMoney(dailyPL)}
                              </p>
                            </div>
                          </div>

                          {/* Extra note if the selected range is longer than we’ve held the stock */}
                          {!usingFullRequestedRange && purchaseDate && (
                            <div className="mt-3 text-sm text-orange-600">
                              Max range available since{" "}
                              {purchaseDate.toLocaleDateString()} – holding for less time
                              than {selectedRange}.
                            </div>
                          )}

                          {/*
                            Alternatively, if purchaseDate is null (invalid), 
                            you just won't show the note at all.
                          */}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
