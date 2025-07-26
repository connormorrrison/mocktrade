import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, CheckCircle } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { MarketStatus, useMarketStatus } from "@/components/market-status";
import { PageLayout } from "@/components/page-layout";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { TextField } from "@/components/text-field";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { formatMoney } from "@/lib/format-money";
import { ErrorTile } from "@/components/error-tile";
import { TradeConfirm } from "@/components/trade-confirm-dialog";
import { StockPriceDisplay } from "@/components/stock-price-display";
import { CustomSkeleton } from "@/components/custom-skeleton";

export default function TradePage() {
  // Loading state first
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Other state
  const isMarketOpen = useMarketStatus();
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState<"buy" | "sell" | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [displaySymbol, setDisplaySymbol] = useState('');
  const [availableCash, setAvailableCash] = useState<number | null>(null);
  const [sharesOwned, setSharesOwned] = useState(0);

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
      setCompanyName('');
      setDisplaySymbol('');
      setError(null);
      setAction(null);
      setQuantity('');
      setSharesOwned(0);
    }
  }, [symbol]);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/v1/portfolio/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCash(data.cash_balance);
      }
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setPageLoading(false);
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
      const token = localStorage.getItem('access_token');
      
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
      setCompanyName(priceData.company_name || symbol.toUpperCase());
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
      setCompanyName('');
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
        const token = localStorage.getItem('access_token');
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
      const token = localStorage.getItem('access_token');
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
      setCompanyName('');
      setAction(null);
      setIsConfirmDialogOpen(false);

    } catch (err: any) {
      setError(err.message || 'Failed to execute trade');
    }
  };

  // Loading check first
  if (pageLoading) {
    return (
      <PageLayout title="Trade">
        <CustomSkeleton />
      </PageLayout>
    );
  }

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
                  uppercase
                  onChange={(e) => {
                    const newValue = e.target.value.toUpperCase();
                    setSymbol(newValue);
                    if (!newValue) {
                      setPrice(null);
                      setCompanyName('');
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
            <ErrorTile description={error} className="mt-4" />

            {/* Stock Price Display */}
            <StockPriceDisplay
              symbol={displaySymbol}
              price={price}
              companyName={companyName}
              sharesOwned={sharesOwned}
              isMarketOpen={isMarketOpen}
              error={error}
            />

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
                    <ErrorTile 
                      description="Insufficient cash available to complete transaction"
                      className="mt-4"
                    />
                  )}
                {action === 'sell' &&
                  quantity &&
                  Number(quantity) > sharesOwned && (
                    <ErrorTile 
                      description={`You can sell up to ${sharesOwned.toLocaleString()} shares`}
                      className="mt-4"
                    />
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
            <TradeConfirm
              isOpen={isConfirmDialogOpen}
              onClose={() => setIsConfirmDialogOpen(false)}
              onConfirm={confirmOrder}
              symbol={symbol}
              action={action || ''}
              quantity={quantity}
              price={price ?? 0}
            />

    </PageLayout>
  );
}