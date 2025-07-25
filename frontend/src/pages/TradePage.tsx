import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { MarketStatus } from "@/components/market-status";
import { PageLayout } from "@/components/page-layout";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { formatMoney } from "@/lib/format-money";

export default function TradePage() {
  // State declarations
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<"buy" | "sell" | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [displaySymbol, setDisplaySymbol] = useState('');
  const [availableCash, setAvailableCash] = useState<number | null>(null);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [isCongratsDialogOpen, setIsCongratsDialogOpen] = useState(false);

  const { symbol: urlSymbol } = useParams<{ symbol?: string }>();
  // Portfolio data
  useEffect(() => {
    let mounted = true;
    
    const loadPortfolioData = async () => {
      try {
        await fetchPortfolioData();
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to load portfolio:', err);
        }
      }
    };

    loadPortfolioData();

    return () => {
      mounted = false;
    };
  }, []);

  // URL Symbol handler with simulated Enter keypress
  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol.toUpperCase());
      // Simulate Enter keypress
      setTimeout(() => {
        fetchStockPrice();
      }, 100);
    }
  }, [urlSymbol]);

  useEffect(() => {
    if (!symbol) {
      setPrice(null);
      setDisplaySymbol('');
      setError(null);
      setAction(null);
      setQuantity('');
      setSharesOwned(0);
    }
  }, [symbol]);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/portfolio/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCash(data.cash_balance);
      }
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
    }
  };

  const fetchStockPrice = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      
      // Fetch both price and portfolio data concurrently
      const [priceResponse, portfolioResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/stocks/quote/${symbol.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/api/v1/trading/portfolio/${symbol.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
  
      if (!priceResponse.ok) {
        throw new Error('Invalid symbol');
      }
  
      const priceData = await priceResponse.json();
      
      // Check if price is 0 and treat it as invalid
      if (priceData.current_price === 0) {
        throw new Error('Invalid symbol');
      }
      
      setPrice(priceData.current_price);
      setDisplaySymbol(symbol.toUpperCase());
  
      // Handle portfolio data
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setSharesOwned(portfolioData.shares || 0);
      } else {
        setSharesOwned(0);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch stock price');
      setPrice(null);
      setSharesOwned(0);
      setQuantity('');
      setAction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    // Safely handle null checks
    const currentPrice = price ?? 0;
    const currentCash = availableCash ?? 0;
    const totalValue = currentPrice * Number(quantity);

    if (action === 'buy' && totalValue > currentCash) {
      setError('Insufficient cash to complete the trade');
      return;
    }
   
    // Refresh shares owned before validating sell order
    if (action === 'sell') {
      try {
        const token = localStorage.getItem('token');
        const portfolioResponse = await fetch(`http://localhost:8000/api/v1/trading/portfolio/${symbol.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          const currentShares = portfolioData.shares || 0;
          setSharesOwned(currentShares);
          
          if (Number(quantity) > currentShares) {
            setError('Insufficient shares to complete the sale');
            return;
          }
        }
      } catch (err: any) {
        setError('Unable to verify current share balance');
        return;
      }
    }
   
    setError(null);
    setIsConfirmDialogOpen(true);
  };

  const confirmOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/trading/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          shares: Number(quantity),
          transaction_type: action ? action.toUpperCase() : ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Trade failed');
      }

      // Refresh portfolio data to get updated cash balance
      await fetchPortfolioData();
      
      // Reset form
      setSymbol('');
      setQuantity('');
      setPrice(null);
      setAction(null);
      setIsConfirmDialogOpen(false);

      // Open success dialog
      setIsCongratsDialogOpen(true);

    } catch (err: any) {
      setError(err.message || 'Failed to execute trade');
    }
  };

  return (
    <PageLayout title="Trade">
            {/* Search Section */}
            <div>
              <Title2>Search</Title2>
              <div className="flex sm:flex-row gap-4">
                <TextField
                  className="flex-1"
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  onChange={(e) => {
                    const newValue = e.target.value.toUpperCase();
                    setSymbol(newValue);
                    if (!newValue) {
                      setPrice(null);
                      setDisplaySymbol('');
                      setError(null);
                      setAction(null);
                      setQuantity('');
                      setSharesOwned(0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchStockPrice();
                    }
                  }}
                />
                <Button2 onClick={fetchStockPrice} disabled={isLoading}>
                  <Search />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button2>
              </div>
            </div>

            {/* Error Handling */}
            {error && (
              <div className="flex items-center text-red-500 mb-4 p-4 bg-red-50 rounded-md">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Stock Price Display */}
            {symbol && price && !error && price !== 0 && (
              <Tile>
                <div className="flex sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <Text4>
                      Market Price for {displaySymbol}
                    </Text4>
                    <Text2>
                      {formatMoney(price)}
                    </Text2>
                    {sharesOwned > 0 && (
                      <Text4>
                        You own {sharesOwned.toLocaleString()}{' '}
                        {sharesOwned === 1 ? 'share' : 'shares'} of {displaySymbol}
                      </Text4>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <Text4>Status</Text4>
                    <div className="flex justify-end">
                      <MarketStatus />
                    </div>
                  </div>
                </div>
              </Tile>
            )}

            {/* Action Section */}
            {symbol && price && !error && (
              <div>
                <Title2>Action</Title2>
                <div className="flex sm:flex-row gap-4">
                  <Button1 
                    onClick={() => setAction('buy')}
                    className="flex-1"
                    variant={action === 'buy' ? 'primary' : 'secondary'}
                  >
                    Buy
                  </Button1>
                  <Button1 
                    onClick={() => setAction('sell')}
                    className="flex-1"
                    variant={action === 'sell' ? 'primary' : 'secondary'}
                    disabled={sharesOwned <= 0}
                  >
                    Sell
                  </Button1>
                </div>
              </div>
            )}

            {/* Quantity Input */}
            {action && (
              <div>
                <Title2>Quantity</Title2>
                <TextField
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => {
                    // Only allow whole numbers
                    const value = Math.floor(Number(e.target.value));
                    if (e.target.value === '') {
                      setQuantity('');
                    } else {
                      setQuantity(value.toString());
                    }
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    // Prevent decimal point
                    if (e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  step="1"
                />
                {action === 'buy' &&
                  price != null &&
                  quantity &&
                  price * Number(quantity) > (availableCash ?? 0) && (
                    <div className="flex items-center text-red-500 mt-2">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      <span>
                        Insufficient cash available to complete transaction
                      </span>
                    </div>
                  )}
                {action === 'sell' &&
                  quantity &&
                  Number(quantity) > sharesOwned && (
                    <div className="flex items-center text-red-500 mt-2">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      <span>
                        You can sell up to {sharesOwned.toLocaleString()} shares
                      </span>
                    </div>
                  )}
              </div>
            )}

            {/* Order Summary */}
            <div>
              <Title2>Order Preview</Title2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Text4>Order</Text4>
                  <Text5>
                    {action && quantity && symbol && Number(quantity) > 0
                      ? `${action.charAt(0).toUpperCase() + action.slice(1)} 
                        ${Number(quantity).toLocaleString()} 
                        ${Number(quantity) === 1 ? 'share' : 'shares'} at Market`
                      : 'N/A'}
                  </Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Price per Share</Text4>
                  <Text5>{price != null ? formatMoney(price) : formatMoney(0)}</Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Cash Available</Text4>
                  <Text5>{formatMoney(availableCash ?? 0)}</Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Total Value</Text4>
                  <Text3>
                    {price != null && quantity && Number(quantity) > 0
                      ? formatMoney(price * Number(quantity))
                      : formatMoney(0)}
                  </Text3>
                </div>
              </div>
            </div>

            {/* Submit Order Button */}
            <Button1 
              className="w-full" 
              onClick={handleSubmitOrder}
              disabled={
                !symbol ||
                !quantity ||
                price == null ||
                Number(quantity) < 1 ||
                !Number.isInteger(Number(quantity)) ||
                (action === 'buy' &&
                  price * Number(quantity) > (availableCash ?? 0)) ||
                (action === 'sell' && Number(quantity) > sharesOwned)
              }
            >
              Submit Order
            </Button1>

            {/* Confirmation Dialog */}
            {isConfirmDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Confirm Order</h3>
                  <p className="text-gray-600 mb-4">Please review your order.</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Symbol:</span>
                      <span className="font-semibold">{symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Action:</span>
                      <span className="font-semibold capitalize">{action}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-semibold">{Number(quantity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per Share:</span>
                      <span className="font-semibold">{formatMoney(price ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-semibold text-lg">{formatMoney((price ?? 0) * Number(quantity))}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button2 onClick={() => setIsConfirmDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button2>
                    <Button1 onClick={confirmOrder} className="flex-1">
                      Confirm Order
                    </Button1>
                  </div>
                </div>
              </div>
            )}

            {/* Success Dialog */}
            {isCongratsDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Order Confirmed</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Your order has been executed. Please visit the Activity tab for details.
                  </p>
                  <Button1 onClick={() => setIsCongratsDialogOpen(false)} className="w-full">
                    Close
                  </Button1>
                </div>
              </div>
            )}
    </PageLayout>
  );
}