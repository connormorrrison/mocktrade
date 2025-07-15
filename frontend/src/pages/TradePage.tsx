import { useState } from "react";
import { Tile } from "@/components/tile";
import { TextField } from "@/components/text-field";
import { SecondaryTitle } from "@/components/secondary-title";
import { PrimaryTitle } from "@/components/primary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
import { SecondaryButton } from "@/components/secondary-button";
import { PrimaryButton } from "@/components/primary-button";

export default function TradePage() {
  // State
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  
  // Mock data
  const symbol = "AAPL";
  const price = 150.25;
  const sharesOwned = 50;
  const availableCash = 12450.32;
  const quantity = "10";

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full" style={{ marginTop: '0px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <PrimaryTitle>Trade</PrimaryTitle>
          
          <div className="space-y-6">
            {/* Search Section */}
            <div>
              <SecondaryTitle>Search</SecondaryTitle>
              <div className="flex gap-2">
                <TextField
                  className="flex-1"
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  readOnly
                />
                <SecondaryButton>
                  Search
                </SecondaryButton>
              </div>
            </div>

            {/* Stock Price Display */}
            <Tile>
              <div className="flex justify-between items-center">
                <div>
                  <TertiaryTitle>
                    Market Price for {symbol}
                  </TertiaryTitle>
                  <p className="text-2xl font-semibold">
                    {formatMoney(price)}
                  </p>
                  <TertiaryTitle>
                    You own {sharesOwned.toLocaleString()} shares of {symbol}
                  </TertiaryTitle>
                </div>
                <div className="text-right">
                  <TertiaryTitle>Status</TertiaryTitle>
                  <div className="flex items-center justify-end">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2" />
                    <p className="text-base text-green-600 font-medium animate-pulse">
                      Live
                    </p>
                  </div>
                </div>
              </div>
            </Tile>

            {/* Action Section */}
            <div>
              <SecondaryTitle>Action</SecondaryTitle>
              <div className="flex gap-2">
                <PrimaryButton 
                  onClick={() => setAction('buy')}
                  className="flex-1"
                  variant={action === 'buy' ? 'primary' : 'secondary'}
                >
                  Buy
                </PrimaryButton>
                <PrimaryButton 
                  onClick={() => setAction('sell')}
                  className="flex-1"
                  variant={action === 'sell' ? 'primary' : 'secondary'}
                >
                  Sell
                </PrimaryButton>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <SecondaryTitle>Quantity</SecondaryTitle>
              <TextField
                type="number"
                value={quantity}
                readOnly
              />
            </div>

            {/* Order Summary */}
            <div>
              <SecondaryTitle>Order Preview</SecondaryTitle>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <TertiaryTitle>Order</TertiaryTitle>
                  <span className="text-base font-medium">
                    {action === 'buy' ? 'Buy' : 'Sell'} {Number(quantity).toLocaleString()} shares at Market
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <TertiaryTitle>Price per Share</TertiaryTitle>
                  <span className="text-base font-medium">{formatMoney(price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <TertiaryTitle>Cash Available</TertiaryTitle>
                  <span className="text-base font-medium">{formatMoney(availableCash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <TertiaryTitle>Total Value</TertiaryTitle>
                  <span className="text-xl font-medium">
                    {formatMoney(price * Number(quantity))}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Order Button */}
            <PrimaryButton className="w-full" disabled>
              Submit Order
            </PrimaryButton>
          </div>
        </div>
      </Tile>
    </div>
  );
}