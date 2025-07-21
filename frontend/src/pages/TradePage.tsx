import { useState } from "react";
import { Search } from "lucide-react";
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
    <PageLayout title="Trade">
            {/* Search Section */}
            <div>
              <Title2>Search</Title2>
              <div className="flex sm:flex-row gap-4">
                <TextField
                  className="flex-1"
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  readOnly
                />
                <Button2>
                  <Search />
                  Search
                </Button2>
              </div>
            </div>

            {/* Stock Price Display */}
            <Tile>
              <div className="flex sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <Text4>
                    Market Price for {symbol}
                  </Text4>
                  <Text2>
                    {formatMoney(price)}
                  </Text2>
                  <Text4>
                    You own {sharesOwned.toLocaleString()} shares of {symbol}
                  </Text4>
                </div>
                <div className="text-left sm:text-right">
                  <Text4>Status</Text4>
                  <div className="flex justify-end">
                    <MarketStatus />
                  </div>
                </div>
              </div>
            </Tile>

            {/* Action Section */}
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
                >
                  Sell
                </Button1>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <Title2>Quantity</Title2>
              <TextField
                type="number"
                value={quantity}
                readOnly
              />
            </div>

            {/* Order Summary */}
            <div>
              <Title2>Order Preview</Title2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Text4>Order</Text4>
                  <Text5>
                    {action === 'buy' ? 'Buy' : 'Sell'} {Number(quantity).toLocaleString()} shares at Market
                  </Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Price per Share</Text4>
                  <Text5>{formatMoney(price)}</Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Cash Available</Text4>
                  <Text5>{formatMoney(availableCash)}</Text5>
                </div>
                <div className="flex justify-between items-center">
                  <Text4>Total Value</Text4>
                  <Text3>
                    {formatMoney(price * Number(quantity))}
                  </Text3>
                </div>
              </div>
            </div>

            {/* Submit Order Button */}
            <Button1 className="w-full" disabled>
              Submit Order
            </Button1>
    </PageLayout>
  );
}