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
  const [action, setAction] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const fetchStockPrice = async () => {
    if (!symbol) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulated price fetching - replace with actual API call
      const response = await fetch(`/api/stock-price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }
      const data = await response.json();
      setPrice(data.price);
    } catch (err) {
      setError(err.message || 'Unable to fetch stock price');
      setPrice(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOrder = () => {
    // Validate order
    if (!symbol || !quantity || quantity <= 0 || !price) {
      setError('Please complete all order details');
      return;
    }

    // Open confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  const confirmOrder = () => {
    // Actual order submission logic would go here
    console.log('Submitting order', { symbol, action, quantity, price });
    // Reset form or show success message
    setIsConfirmDialogOpen(false);
    // Reset form state
    setSymbol('');
    setQuantity('');
    setPrice(null);
  };

  return (
    <div className="p-8 w-full mt-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search Section */}
            <div className="flex gap-2 mb-6">
              <Input 
                placeholder="Enter symbol (e.g., AAPL)" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
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

            {/* Error Handling */}
            {error && (
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Section */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">Action</label>
              <div className="flex gap-2">
                <Button 
                  variant={action === 'buy' ? 'default' : 'outline'}
                  className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action === 'buy' 
                      ? 'bg-green-600 text-white border-green-700 hover:bg-green-800 focus:ring-green-500' 
                      : 'bg-white text-green-500 border-green-500 hover:bg-green-50 focus:ring-green-500'
                  }`}
                  onClick={() => setAction('buy')}
                >
                  Buy
                </Button>
                <Button 
                  variant={action === 'sell' ? 'default' : 'outline'}
                  className={`flex-1 w-full border px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action === 'buy' 
                      ? 'bg-red-600 text-white border-red-700 hover:bg-red-800 focus:ring-red-500' 
                      : 'bg-white text-red-500 border-red-500 hover:bg-red-50 focus:ring-red-500'
                  }`}
                  onClick={() => setAction('sell')}
                >
                  Sell
                </Button>
              </div>
            </div>

            {/* Order Form */}
            <div className="flex flex-col space-y-6 h-full">
              {/* Quantity Input */}
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
              </div>

              {/* Order Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Market Price</span>
                  <span className="font-medium">
                    {price ? `$${price.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Value</span>
                  <span className="text-xl font-bold">
                    {price && quantity 
                      ? `$${(price * Number(quantity)).toFixed(2)}` 
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
                    Please review your order details before submitting.
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
                    <span className="font-semibold">${price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-bold text-lg">
                      ${price && quantity ? (price * Number(quantity)).toFixed(2) : '0.00'}
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