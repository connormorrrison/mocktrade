// src/pages/TradePage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";

export default function TradePage() {
  // State declarations
  // (1) Add union types where needed
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
  const [isVisible, setIsVisible] = useState(false);
  const [isCongratsDialogOpen, setIsCongratsDialogOpen] = useState(false);

  const { symbol: urlSymbol } = useParams<{ symbol?: string }>();

  // CSS Classes
  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
        });
        document.querySelector('input')?.dispatchEvent(enterEvent);
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
      const response = await fetch('https://mocktrade-backend.onrender.com/api/v1/trading/portfolio', {
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
        fetch(`https://mocktrade-backend.onrender.com/api/v1/stocks/quote/${symbol.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://mocktrade-backend.onrender.com/api/v1/trading/portfolio/${symbol.toUpperCase()}`, {
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
        const portfolioResponse = await fetch(`https://mocktrade-backend.onrender.com/api/v1/trading/portfolio/${symbol.toUpperCase()}`, {
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
      const response = await fetch('https://mocktrade-backend.onrender.com/api/v1/trading/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          shares: Number(quantity),
          // action is guaranteed not null if we made it here, but we do a fallback:
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

  // (2) Type the parameter here
  const formatMoney = (value: number, currency = 'USD') => {
    return `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} ${currency}`;
  };
  
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
          <CardTitle className="text-3xl font-normal">Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Search Section */}
            <div>
              <label className="block text-base text-gray-500 mb-2">Search</label>
              <div className="flex gap-2">
                <Input
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
                  className={error && !symbol ? 'border-red-500' : ''}
                />
                <Button
                  className="text-base"
                  onClick={fetchStockPrice}
                  disabled={isLoading}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {symbol && price && !error && price !== 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md border-2 pulsate-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-base text-gray-500 ml-2">
                      Market Price for {displaySymbol}
                    </p>
                    <p className="text-2xl font-semibold ml-2">
                      {formatMoney(price)}
                    </p>
                    {sharesOwned > 0 && (
                      <p className="text-base text-gray-500 ml-2">
                        You own {sharesOwned.toLocaleString()}{' '}
                        {sharesOwned === 1 ? 'share' : 'shares'} of {displaySymbol}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-base text-gray-500 mr-4">Status</p>
                    <div className="flex items-center justify-end mr-4">
                      <p className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2" />
                      <p className="text-green-600 font-medium animate-pulse">
                        Live
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Handling */}
            {error &&
              error !== 'Insufficient cash to complete the trade' &&
              error !== 'Please enter a valid quantity' && (
                <div
                  className="flex items-center text-red-500 mb-4"
                  style={{ marginTop: '24px' }}
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

            {/* Action Section */}
            {symbol && price && !error && (
              <div>
                <label className="block text-base text-gray-500 mb-2 -mt-2">
                  Action
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200 shadow-md
                      ${
                        action === 'buy'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-gray-200'
                          : 'bg-white text-blue-600 border-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    onClick={() => setAction('buy')}
                  >
                    Buy
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200 shadow-md
                      ${
                        action === 'sell'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-gray-200'
                          : 'bg-white text-blue-600 border-gray-200 hover:bg-blue-600 hover:text-white'
                      }`}
                    onClick={() => setAction('sell')}
                    disabled={sharesOwned <= 0}
                    title={sharesOwned <= 0 ? "You don't own any shares to sell" : ''}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            )}

            {/* Order Form */}
            <div className="flex flex-col space-y-6 h-full">
              {/* Quantity Input with Error Message */}
              {action && (
                <div>
                  <label className="block text-base text-gray-500 mb-2 -mt-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    className={`text-lg ${
                      action === 'buy' &&
                      price != null &&
                      quantity &&
                      price * Number(quantity) > (availableCash ?? 0)
                        ? 'border-red-500'
                        : ''
                    }`}
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
                      <div className="flex items-center text-red-500 mt-6">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>
                          Insufficient cash available to complete transaction
                        </span>
                      </div>
                    )}
                  {action === 'sell' &&
                    quantity &&
                    Number(quantity) > sharesOwned && (
                      <div className="flex items-center text-red-500 mt-6">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        <span>
                          You can sell up to {sharesOwned.toLocaleString()} shares
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-1 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order</span>
                  <span className="font-medium">
                    {action && quantity && symbol && Number(quantity) > 0
                      ? // (3) Safe call or type-cast since we already check action && quantity
                        `${action.charAt(0).toUpperCase() + action.slice(1)} 
                        ${Number(quantity).toLocaleString()} 
                        ${Number(quantity) === 1 ? 'share' : 'shares'} at Market`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Price per Share</span>
                  <span className="font-medium">
                    {price != null ? formatMoney(price) : formatMoney(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Cash Available</span>
                  <span className="font-medium">
                    {formatMoney(availableCash ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Value</span>
                  <span className="text-xl font-semibold">
                    {price != null && quantity && Number(quantity) > 0
                      ? formatMoney(price * Number(quantity))
                      : formatMoney(0)}
                  </span>
                </div>
              </div>

              {/* Submit Order Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
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
              </Button>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Order</DialogTitle>
                  <DialogDescription>Please review your order.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Symbol:</span>
                    <span className="text-base font-semibold">{symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Action:</span>
                    <span className="text-base font-semibold capitalize">
                      {action}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="text-base font-semibold">
                      {Number(quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Share:</span>
                    <span className="text-base font-semibold">
                      {formatMoney(price ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-semibold text-lg">
                      {formatMoney((price ?? 0) * Number(quantity))}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={confirmOrder}>Confirm Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Congratulations Dialog */}
            <Dialog
              open={isCongratsDialogOpen}
              onOpenChange={setIsCongratsDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <DialogTitle>Order Confirmed</DialogTitle>
                  </div>
                  <DialogDescription className="text-base pt-2">
                    Your order has been executed. Please visit the Transactions
                    tab for details.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => setIsCongratsDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
