// Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Portfolio position interface with fields for calculations
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
  const [setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<string>('symbol'); // Sorting state
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1mo');
  const [portfolioHistory, setPortfolioHistory] = useState<any>(null);
  const [testStockData, setTestStockData] = useState<any>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  
  // Fetch historical data whenever timerange changes
  useEffect(() => {
    fetchPortfolioHistory(selectedTimeRange);
    // Only fetch chart data if a symbol is currently expanded
    if (expandedSymbol) {
      fetchTestHistoricalData(selectedTimeRange, expandedSymbol);
    }
  }, [selectedTimeRange, expandedSymbol]);  

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

  const toggleSymbolExpansion = (symbol: string) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

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
  
      const validPositions = (data.positions || []).map(position => {
        const current = typeof position.current_price === 'number' ? position.current_price : 0;
        const previous = typeof position.previous_price === 'number' && position.previous_price !== 0 
          ? position.previous_price 
          : current; // Use current price if no previous price available
        
        return {
          ...position,
          shares: typeof position.shares === 'number' ? position.shares : 0,
          current_price: current,
          previous_price: previous,
        };
      });
  
      setPositions(validPositions);
      setCashBalance(typeof data.cash_balance === 'number' ? data.cash_balance : 0);
      setInitialInvestment(data.initial_investment || 100000);
      setError(null);
    } catch (err) {
      setError('Unable to load portfolio data');
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

// If your backend doesn't require the positions from the client 
// (maybe it fetches them by user automatically), you can do:

const fetchPortfolioHistory = async (range: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:8000/api/v1/stocks/portfolio/history?range=${range}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch portfolio history');
    const data = await response.json();
    setPortfolioHistory(data);
  } catch (err) {
    console.error('Error fetching portfolio history:', err);
  }
};


  function aggregatePortfolioHistory(rawData: any): Array<{ date: string; totalValue: number }> {
    // rawData looks like: {
    //   "AAPL": [{ "date": "...", "value": 123.45 }, ...],
    //   "MSFT": [{ "date": "...", "value": 210.12 }, ...],
    //   ...
    // }
  
    // 1. Collect all unique dates across all symbols.
    const allDates = new Set<string>();
    for (const symbol in rawData) {
      rawData[symbol].forEach((entry: any) => {
        allDates.add(entry.date);
      });
    }
  
    // 2. For each date, sum up the values from all symbols.
    const dateValueMap: Record<string, number> = {};
    allDates.forEach((date) => {
      let totalOnThisDate = 0;
  
      for (const symbol in rawData) {
        // Find the entry with matching date, if any.
        const entry = rawData[symbol].find((e: any) => e.date === date);
        if (entry) {
          totalOnThisDate += entry.value;
        }
      }
      dateValueMap[date] = totalOnThisDate;
    });
  
    // 3. Convert the dateValueMap to a sorted array by date
    const combinedHistory = Object.keys(dateValueMap)
      .map((date) => ({
        date,
        totalValue: dateValueMap[date],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    return combinedHistory;
  }  

  const fetchTestHistoricalData = async (range: string, symbol: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/stocks/history/${symbol}?range=${range}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setTestStockData(data);
    } catch (err) {
      console.error('Error:', err);
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

  function PortfolioHistoryChart({ portfolioData }: { portfolioData: any }) {
    const combinedHistory = aggregatePortfolioHistory(portfolioData); 
    // from Step 3 above
  
    if (!combinedHistory || combinedHistory.length === 0) {
      return <p>No portfolio history found.</p>;
    }
  
    const chartData = {
      labels: combinedHistory.map((item) =>
        new Date(item.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Portfolio Value',
          data: combinedHistory.map((item) => item.totalValue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: {
          display: true,
          text: 'Portfolio Value Over Time',
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: number) => formatMoney(value),
          },
        },
      },
    };
  
    return (
      <div className="h-96 bg-white p-4 rounded-lg">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  }
  

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
              
              {/* Portfolio Performance Chart */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Portfolio Performance Over Time</h3>
                <select
                  className="border border-gray-300 rounded-md p-1"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                >
                  <option value="1mo">1 Month</option>
                  <option value="3mo">3 Months</option>
                  <option value="6mo">6 Months</option>
                  <option value="1y">1 Year</option>
                  <option value="2y">2 Years</option>
                  <option value="5y">5 Years</option>
                  <option value="max">Max</option>
                </select>

                {portfolioHistory && Object.keys(portfolioHistory).length > 0 && (
                  <PortfolioHistoryChart portfolioData={portfolioHistory} />
                )}
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
                        <div key={position.symbol}>
                        <div
                          onClick={() => toggleSymbolExpansion(position.symbol)}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
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
                      
                          <div className="ml-8 flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent div's onClick
                                navigate(`/trade/${position.symbol}`);
                              }}
                              className="px-6 py-2 mr-6 bg-black text-white text-base hover:bg-gray-800"
                            >
                              Trade
                            </button>
                          </div>
                        </div>
                      
                        {/* Expanded Chart Section */}
                        {expandedSymbol === position.symbol && testStockData && (
                          <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border shadow-md border-gray-200">
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-medium">{position.symbol} Price History</h4>
                              <select
                              className="border border-gray-300 rounded-md p-1"
                              value={selectedTimeRange}
                              onChange={(e) => setSelectedTimeRange(e.target.value)}
                              >
                                <option value="1mo">1 Month</option>
                                <option value="3mo">3 Months</option>
                                <option value="6mo">6 Months</option>
                                <option value="1y">1 Year</option>
                                <option value="2y">2 Years</option>
                                <option value="5y">5 Years</option>
                                <option value="max">Max</option>
                              </select>
                            </div>
                      
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p><strong>Current Price:</strong> {formatMoney(testStockData.current_price)}</p>
                              <p>
                                <strong>Change:</strong> 
                                <span className={testStockData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {testStockData.change >= 0 ? '+' : ''}{formatMoney(testStockData.change)} 
                                  ({testStockData.change_percent.toFixed(2)}%)
                                </span>
                              </p>
                            </div>
                            
                            <div className="h-96 bg-white rounded-lg">
                              <Line 
                                data={{
                                  labels: testStockData.historical_prices.map(p => new Date(p.date).toLocaleDateString()),
                                  datasets: [{
                                    label: `${position.symbol} Price`,
                                    data: testStockData.historical_prices.map(p => p.close),
                                    borderColor: 'rgb(75, 192, 192)',
                                    tension: 0.1
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'top',
                                    },
                                    title: {
                                      display: true,
                                      text: `${position.symbol} Price History`
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: false,
                                      ticks: {
                                        callback: value => formatMoney(value)
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
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