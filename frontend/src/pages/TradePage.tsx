import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";

export default function TradePage() {
  const [symbol, setSymbol] = useState('');
  const [action, setAction] = useState(null);  // Initialize to null for no selection
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [displaySymbol, setDisplaySymbol] = useState(''); // New state to hold the symbol for price display
  const [availableCash, setAvailableCash] = useState(5000); // Initial cash balance
  const [sharesOwned, setSharesOwned] = useState(0);

  const fetchStockPrice = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      // Fetch stock price
      const priceResponse = await fetch(`http://localhost:8000/api/v1/stocks/quote/${symbol.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!priceResponse.ok) {
        throw new Error('Invalid stock symbol');
      }
  
      const priceData = await priceResponse.json();
      setPrice(priceData.current_price);
      setDisplaySymbol(symbol.toUpperCase());
  
      // Fetch shares owned
      const portfolioResponse = await fetch(`http://localhost:8000/api/v1/trading/portfolio/${symbol.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setSharesOwned(portfolioData.shares || 0);
      } else {
        setSharesOwned(0);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch stock price');
      setPrice(null);
      setSharesOwned(0);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSubmitOrder = () => {
    if (!symbol || !quantity || quantity <= 0 || !price) {
      setError('Please complete all order details');
      return;
    }
  
    const totalValue = price * Number(quantity);
  
    if (action === 'buy' && totalValue > availableCash) {
      setError('Insufficient cash to complete the trade');
      return;
    }
  
    if (action === 'sell' && Number(quantity) > sharesOwned) {
      setError('Insufficient shares to complete the sale');
      return;
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
          symbol: symbol,
          shares: Number(quantity),
          transaction_type: action.toUpperCase()
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Trade failed');
      }
  
      const totalValue = price * Number(quantity);
      
      // Update available cash and shares owned
      setAvailableCash((prevCash) => {
        if (action === 'buy') {
          return prevCash - totalValue;
        } else {
          return prevCash + totalValue;
        }
      });
  
      setSharesOwned((prevShares) => {
        if (action === 'buy') {
          return prevShares + Number(quantity);
        } else {
          return prevShares - Number(quantity);
        }
      });
  
      setSymbol('');
      setQuantity('');
      setPrice(null);
      setAction(null); // Add this line to reset the action
      setIsConfirmDialogOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to execute trade');
    }
  };
  

  return (
    <div className="p-8 w-full mt-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Search Section */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Search</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => {
                  const newValue = e.target.value.toUpperCase();
                  setSymbol(newValue);
                  if (!newValue) { // If input is cleared
                    setPrice(null); // Clear the price
                    setError(null); // Clear any errors
                    setAction(null); // Reset the action
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
                onClick={fetchStockPrice}
                disabled={isLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

            {/* Stock Price and Shares Owned Display */}
            {price && !error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg transition-all duration-200 ease-in-out">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 ml-2">Market Price for {displaySymbol}</p>
                    <p className="text-2xl font-bold ml-2">${price} USD</p>
                    {sharesOwned > 0 && (
                      <p className="text-sm text-gray-600 ml-2 mt-1">
                        You own {sharesOwned} shares
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mr-2">Status</p>
                    <p className="text-green-600 font-medium mr-2 animate-pulse">Live</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Handling */}
            {error && (
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            

            {/* Action Section */}
            {price && !error && (
              <div>
                <label className="block text-sm text-gray-500 mb-2">Action</label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200
                      ${action === 'buy' 
                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-600 hover:border-green-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600'}`}
                    onClick={() => setAction('buy')}
                  >
                    Buy
                  </Button>
                  <Button 
                    variant="outline"
                    className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200
                      ${action === 'sell' 
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-600 hover:border-red-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600'}`}
                    onClick={() => setAction('sell')}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            )}

            {/* Order Form */}
            <div className="flex flex-col space-y-6 h-full">
              {/* Quantity Input */}
              {action && (
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Quantity</label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="text-lg"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                  />
                  {action === 'sell' && sharesOwned > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum available to sell: {sharesOwned} shares
                    </p>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order</span>
                  <span className="font-medium">
                    {action && quantity && symbol 
                      ? `${action.charAt(0).toUpperCase() + action.slice(1)} ${quantity} shares at Market`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Market Price</span>
                  <span className="font-medium">
                    {price ? `$${price.toFixed(2)} USD` : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Available Cash</span>
                  <span className="font-medium">
                    ${availableCash.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Value</span>
                  <span className="text-xl font-bold">
                    {price && quantity 
                      ? `$${(price * Number(quantity)).toFixed(2)} USD` 
                      : '$0.00'}
                  </span>
                </div>
              </div>


              {/* Submit Order Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                onClick={handleSubmitOrder}
                disabled={!symbol || !quantity || !price}
              >
                Submit Order
              </Button>
            </div>

            {/* Confirmation Dialog */}
            <Dialog 
              open={isConfirmDialogOpen} 
              onOpenChange={setIsConfirmDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Order</DialogTitle>
                  <DialogDescription>
                    Please review your order.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Share:</span>
                    <span className="font-semibold">${price?.toFixed(2) || '0.00'} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-bold text-lg">
                      ${price && quantity ? (price * Number(quantity)).toFixed(2) : '0.00'} USD
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
                  <Button onClick={confirmOrder}>
                    Confirm Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
          </div>
        </CardContent>
      </Card>

     {/* Absolutely positioned copyright */}
     <div className="absolute bottom-0 left-0 w-full py-4 text-center text-sm text-gray-600">
        © 2025 MockTrade
      </div>
    </div>
  );
}