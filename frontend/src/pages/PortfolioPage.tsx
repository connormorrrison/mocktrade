import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PortfolioHistoryChart from '../components/PortfolioHistoryChart';

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
  // Avoid mutating the same date object by using a fresh copy each time.
  const now = new Date();
  switch (range) {
    case "1mo":
      return new Date(new Date().setMonth(now.getMonth() - 1));
    case "3mo":
      return new Date(new Date().setMonth(now.getMonth() - 3));
    case "6mo":
      return new Date(new Date().setMonth(now.getMonth() - 6));
    case "1y":
      return new Date(new Date().setFullYear(now.getFullYear() - 1));
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
  const [isVisible, setIsVisible] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState<any>(null);
  const navigate = useNavigate();

  // Fade in effect for the card
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  // Fetch portfolio data on mount (only once)
  useEffect(() => {
    if (!hasFetched) {
      fetchPortfolioData();
      setHasFetched(true);
    }
  }, [hasFetched]);

  // Also refetch portfolio history whenever the selected range changes
  useEffect(() => {
    fetchPortfolioHistory(selectedRange);
  }, [selectedRange]);

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
      console.log("Positions from server:", data.positions);

      const validPositions = (data.positions || []).map((position: any) => {
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
          created_at: isValid ? parsed.toISOString() : null,
        };
      });

      setPositions(validPositions);
      setCashBalance(data.cash_balance || 0);
      setInitialInvestment(data.initial_investment || 100000);
      setError(null);

      // Fetch historical prices for each position based on the selected range.
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
      const earliestInRange = getEarliestDateForRange(range);

      const updatedPositions = await Promise.all(
        positions.map(async (position) => {
          // Determine final start date: max of rangeEarliestDate and purchaseDate
          const purchaseDate = position.created_at ? new Date(position.created_at) : null;
          let finalStartDate: Date | null = null;

          if (!earliestInRange && purchaseDate) {
            finalStartDate = purchaseDate;
          } else if (earliestInRange && !purchaseDate) {
            finalStartDate = earliestInRange;
          } else if (earliestInRange && purchaseDate) {
            finalStartDate = new Date(Math.max(earliestInRange.getTime(), purchaseDate.getTime()));
          }

          const response = await fetch(
            `http://localhost:8000/api/v1/stocks/history/${position.symbol}?range=${range}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch historical data for ${position.symbol}`);
            return { ...position, price_at_selected_range: position.average_price };
          }

          const data = await response.json();
          if (
            data.historical_prices &&
            data.historical_prices.length > 0 &&
            finalStartDate
          ) {
            // Sort ascending, then find the first price AFTER finalStartDate
            const filteredPrices = data.historical_prices
              .filter((p: any) => new Date(p.date) >= finalStartDate)
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (filteredPrices.length > 0) {
              const oldestPrice = filteredPrices[0].close;
              return {
                ...position,
                price_at_selected_range: oldestPrice,
              };
            }
          }

          return { ...position, price_at_selected_range: position.average_price };
        })
      );

      setPositions(updatedPositions);
    } catch (err) {
      console.error('Error fetching historical prices:', err);
    }
  }

  // Fetch the overall portfolio history for the chart
  async function fetchPortfolioHistory(range: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/stocks/portfolio/history?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio history');
      }
      const data = await response.json();
      console.log("Raw portfolio history data:", data);
      setPortfolioHistory(data);
    } catch (err) {
      console.error('Error fetching portfolio history:', err);
    }
  }

  function handleRangeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedRange(event.target.value);
    // Refetch historical prices for positions when range changes.
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

  // Calculate the starting portfolio value for the selected range.
  const startingPortfolioValue =
    positions.reduce(
      (sum, pos) =>
        sum + pos.shares * (pos.price_at_selected_range !== undefined ? pos.price_at_selected_range : pos.average_price),
      0
    ) + cashBalance;
  const cumulativeReturn =
    startingPortfolioValue > 0
      ? ((totalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) * 100
      : 0;

  // --- NEW LINES START ---
  // Compute the earliest purchase date from all positions.
  const earliestPurchaseDate = positions.reduce((earliest: Date | null, pos) => {
    if (!pos.created_at) return earliest;
    const purchaseDate = new Date(pos.created_at);
    if (!earliest || purchaseDate < earliest) return purchaseDate;
    return earliest;
  }, null);

  // Determine the cumulative return label based on the selected range.
  const rangeEarliestDate = getEarliestDateForRange(selectedRange);
  let cumulativeReturnLabel = '';
  if (selectedRange === 'max' || !rangeEarliestDate || !earliestPurchaseDate || earliestPurchaseDate > rangeEarliestDate) {
    cumulativeReturnLabel = 'Cumulative Return (available)';
  } else {
    cumulativeReturnLabel = `Cumulative Return (${selectedRange})`;
  }
  // --- NEW LINES END ---

  return (
    <div className="p-8 w-full mt-8">
      <Card
        className={`
          w-full shadow-lg hover:shadow-xl transition-shadow
          ${baseCardClass}
          ${isVisible ? visibleCardClass : hiddenCardClass}
        `}
      >
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
                    <p className="text-gray-500">{cumulativeReturnLabel}</p>
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

              {/* Portfolio History Section */}
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-medium mr-4">Portfolio History</h3>
                  <div className="flex items-center">
                    <label className="mr-2 text-gray-500">Range:</label>
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
                </div>
                <PortfolioHistoryChart 
                  portfolioData={portfolioHistory} 
                  currentPortfolioValue={totalPortfolioValue} 
                />
                <p className="mt-2 text-base text-gray-500">
                  Note: Historical data includes only completed trading days.
                </p>
              </div>

              {/* Holdings */}
              <div>
                <h3 className="text-xl font-medium pb-4">Holdings</h3>
                {positions.length === 0 ? (
                  <p className="text-gray-500">No positions in portfolio</p>
                ) : (
                  <div className="space-y-6">
                    {positions.map((pos) => {
                      console.log('Rendered position:', pos);
                      const purchaseDate = pos.created_at ? new Date(pos.created_at) : null;
                      const isMax = selectedRange === "max";
                      const showHoldingNote =
                        purchaseDate && (isMax || (rangeEarliestDate && purchaseDate > rangeEarliestDate));

                      const noteMessage = isMax
                        ? "Displaying max time period."
                        : `Data available from ${purchaseDate?.toLocaleDateString()}. The selected range exceeds the holding period.`;

                      const label = showHoldingNote
                        ? `Gain (available)`
                        : `Gain (${selectedRange})`;

                      // --- CHANGED LINES START ---
                      // Define an effective purchase price.
                      // Use the historical price if it exists and differs from current_price,
                      // otherwise use the average_price (actual transaction price).
                      const effectivePurchasePrice =
                        pos.price_at_selected_range && pos.price_at_selected_range !== pos.current_price
                          ? pos.price_at_selected_range
                          : pos.average_price;
                      const gainSinceRange = (pos.current_price - effectivePurchasePrice) * pos.shares;
                      const gainPercentSinceRange = effectivePurchasePrice > 0
                        ? ((pos.current_price - effectivePurchasePrice) / effectivePurchasePrice) * 100
                        : 0;
                      // --- CHANGED LINES END ---

                      const dailyPL = pos.previous_price
                        ? (pos.current_price - pos.previous_price) * pos.shares
                        : 0;

                      const dailyPercent =
                        pos.previous_price && pos.previous_price > 0
                          ? ((pos.current_price - pos.previous_price) / pos.previous_price) * 100
                          : 0;

                      const currentValue = pos.shares * pos.current_price;

                      return (
                        <div key={pos.symbol} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-center">
                            {/* Symbol & Shares */}
                            <div>
                              <p className="text-lg font-semibold ml-2">{pos.symbol}</p>
                              <p className="text-gray-500 ml-2">
                                {pos.shares} {pos.shares === 1 ? 'share' : 'shares'}
                              </p>
                            </div>

                            {/* Current Price */}
                            <div className="text-right">
                              <p className="text-gray-500">Current Price</p>
                              <p className="font-medium">{formatMoney(pos.current_price)}</p>
                            </div>

                            {/* Current Value */}
                            <div className="text-right">
                              <p className="text-gray-500">Current Value</p>
                              <p className="font-medium">{formatMoney(currentValue)}</p>
                            </div>

                            {/* Gain (with dynamic label) */}
                            <div className="text-right">
                              <p className="text-gray-500">{label}</p>
                              <p
                                className={`font-medium ${
                                  gainSinceRange >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {gainSinceRange >= 0 ? '+' : ''}
                                {formatMoney(gainSinceRange)}
                                {' '}
                                <span className={`font-medium ${gainSinceRange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({gainPercentSinceRange >= 0 ? '+' : ''}
                                  {gainPercentSinceRange.toFixed(2)}%)
                                </span>
                              </p>
                            </div>

                            {/* Daily P/L */}
                            <div className="text-right">
                              <p className="text-gray-500 mr-2">Daily P/L</p>
                              <p
                                className={`font-medium mr-2 ${
                                  dailyPL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {dailyPL >= 0 ? '+' : ''}
                                {formatMoney(dailyPL)}
                                {' '}
                                <span className={`font-medium ${dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({dailyPercent >= 0 ? '+' : ''}
                                  {dailyPercent.toFixed(2)}%)
                                </span>
                              </p>
                            </div>

                            {/* Trade Button */}
                            <div className="text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/trade/${pos.symbol}`);
                                }}
                                className="px-6 py-2 mr-2 bg-black text-white text-base hover:bg-gray-800"
                              >
                                Trade
                              </button>
                            </div>
                          </div>

                          {/* Note in the same spot */}
                          {showHoldingNote && purchaseDate && (
                            <div className="mt-2 ml-2 text-base text-gray-500">
                              {noteMessage}
                            </div>
                          )}
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
