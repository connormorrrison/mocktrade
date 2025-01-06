import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Portfolio position interface with additional fields for calculations
interface PortfolioPosition {
  symbol: string;
  shares: number;
  current_price: number;
  total_value: number;
  previous_price?: number; // For calculating price changes
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [initialInvestment, setInitialInvestment] = useState(0); // Dynamically fetched
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [sortOption, setSortOption] = useState<string>('symbol'); // Sorting state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  // With this updated version:
  useEffect(() => {
    // Initial fetch
    fetchPortfolioData();
    
    // Set up polling interval to fetch every minute
    const intervalId = setInterval(fetchPortfolioData, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/trading/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();

      const validPositions = (data.positions || []).map(position => ({
        ...position,
        shares: typeof position.shares === 'number' ? position.shares : 0,
        current_price: typeof position.current_price === 'number' ? position.current_price : 0,
        previous_price: typeof position.previous_price === 'number' ? position.previous_price : 0,
      }));

      setPositions(validPositions);
      setCashBalance(typeof data.cash_balance === 'number' ? data.cash_balance : 0);
      setInitialInvestment(data.initial_investment || 100000); // Fallback if not provided
      setError(null);
    } catch (err) {
      setError('Unable to load portfolio data');
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (value: number | null | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const totalPortfolioValue = positions.reduce((sum, position) => {
    const positionValue = position.shares * position.current_price;
    return sum + positionValue;
  }, 0) + cashBalance;

  const cumulativeReturn =
    initialInvestment > 0
      ? ((totalPortfolioValue - initialInvestment) / initialInvestment) * 100
      : 0;

  const calculateChange = (current: number, previous: number | undefined) => {
    if (previous && previous > 0) {
      const dollarChange = current - previous;
      const percentChange = (dollarChange / previous) * 100;
      return { dollarChange, percentChange };
    }
    return { dollarChange: 0, percentChange: 0 };
  };

  const pieData = {
    labels: [...positions.map((pos) => pos.symbol), 'Cash'],
    datasets: [
      {
        data: [...positions.map((pos) => pos.shares * pos.current_price), cashBalance],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14  // Increased from 12
          }
        }
      },
      tooltip: {
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16
        }
      }
    },
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    const aValue = a.shares * a.current_price;
    const bValue = b.shares * b.current_price;
    const { dollarChange: aDollarChange } = calculateChange(a.current_price, a.previous_price);
    const { dollarChange: bDollarChange } = calculateChange(b.current_price, b.previous_price);

    switch (sortOption) {
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'totalValue':
        return bValue - aValue;
      case 'gainLoss':
        return (bDollarChange * b.shares) - (aDollarChange * a.shares);
      default:
        return 0;
    }
  });

  return (
    <div className="p-8 w-full mt-8">
              <Card className={`
                w-full shadow-lg hover:shadow-xl transition-shadow 
                ${baseCardClass}
                ${isVisible ? visibleCardClass : hiddenCardClass}
              `}>
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Account Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500">Total Portfolio Value</p>
                  <p className="text-4xl font-semibold">{formatMoney(totalPortfolioValue)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cash Balance</p>
                  <p className="text-2xl font-semibold">{formatMoney(cashBalance)}</p>
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

              <div>
                <h3 className="text-xl font-medium mb-4">Asset Breakdown</h3>
                <div className="w-full md:w-1/2 lg:w-1/3 mx-auto">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Holdings</h3>

                <div className="mb-6">
                  <label className="mr-2 text-gray-500" htmlFor="sortOptions">
                    Sort by:
                  </label>
                  <select
                    id="sortOptions"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-gray-300 rounded-md p-1"
                  >
                    <option value="symbol">Symbol (A-Z)</option>
                    <option value="totalValue">Total Value (High - Low)</option>
                    <option value="gainLoss">Daily Gain/Loss (High - Low)</option>
                  </select>
                </div>

                {positions.length === 0 ? (
                  <p className="text-gray-500">No positions in portfolio</p>
                ) : (
                  <div className="space-y-6 w-full">
                    {sortedPositions.map((position) => {
                      const { dollarChange, percentChange } = calculateChange(
                        position.current_price,
                        position.previous_price
                      );
                      const dailyGainLoss = dollarChange * position.shares;

                      return (
                        <div
                          key={position.symbol}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-md"
                        >
                          <div className="flex-1">
                            <div className="flex items-baseline gap-3">
                              <p className="text-xl font-semibold ml-6">{position.symbol}</p>
                              <p className="text-base text-gray-500">
                                {position.shares.toLocaleString()}{' '}
                                {position.shares === 1 ? 'share' : 'shares'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex-1 text-right space-y-1.5">
                            <p className="text-base">
                              <span className="text-gray-500">Current Price: </span>
                              <span className="font-medium text-gray-900">{formatMoney(position.current_price)}</span>
                            </p>
                            
                            <p className="text-base">
                              <span className="text-gray-500">Market Value: </span>
                              <span className="font-medium text-gray-900">{formatMoney(position.shares * position.current_price)}</span>
                            </p>
                    
                            <p className={`text-base ${dollarChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {dollarChange >= 0 
                                ? <><span className="text-gray-500">Gain: </span><span className="font-medium">+{formatMoney(dollarChange)} ({percentChange.toFixed(2)}%)</span></>
                                : <><span className="text-gray-500">Loss: </span><span className="font-medium">{formatMoney(dollarChange)} ({percentChange.toFixed(2)}%)</span></>}
                            </p>
                    
                            <p className="text-base">
                              <span className="text-gray-500">Daily P/L: </span>
                              <span className={`font-medium ${dailyGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatMoney(dailyGainLoss)}
                              </span>
                            </p>
                          </div>
                    
                          {/* Add the new Trade button */}
                          <div className="ml-8 flex items-center">
                            <button
                              onClick={() => navigate(`/trade/${position.symbol}`)}
                              className="px-6 py-2 mr-6 text-white text-base"
                            >
                              Trade
                            </button>
                          </div>
                        </div>
                      );

                    })}
                    <div className="mt-4 text-base text-gray-500 text-center">
                      Total holdings: {positions.length}
                    </div>
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
