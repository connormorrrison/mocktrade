import { TrendingUp, X } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";

interface WatchlistStock {
  symbol: string;
  name: string;
  current_price: number;
  previous_price: number;
  market_capitalization: string;
}

interface WatchlistTileProps {
  stock: WatchlistStock;
  onTrade?: (symbol: string) => void;
  onRemove?: (symbol: string) => void;
}

export function WatchlistTile({ stock, onTrade, onRemove }: WatchlistTileProps) {
  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  const dailyChange = stock.current_price - stock.previous_price;
  const dailyPercent = stock.previous_price > 0 
    ? ((stock.current_price - stock.previous_price) / stock.previous_price) * 100 
    : 0;

  return (
    <Tile>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_2fr_2fr_auto] lg:items-center gap-4 w-full text-left">
        {/* Symbol & Name */}
        <div className="ml-2">
          <Text6>{stock.symbol}</Text6>
          <Text4 className="break-words">{stock.name}</Text4>
        </div>

        {/* Current Price */}
        <div className="text-left">
          <Text4>Current Price</Text4>
          <Text5 className="break-words">
            {formatMoney(stock.current_price)}
          </Text5>
        </div>

        {/* Daily Change */}
        <div className="text-left">
          <Text4>Daily Change</Text4>
          <Text5 variant={dailyChange >= 0 ? "green" : "red"} className="break-words">
            {dailyChange >= 0 ? "+" : ""}
            {formatMoney(dailyChange)}{" "}
            ({dailyPercent >= 0 ? "+" : ""}
            {dailyPercent.toFixed(2)}
            %)
          </Text5>
        </div>

        {/* Market Cap */}
        <div className="text-left">
          <Text4>Market Capitalization</Text4>
          <Text5 className="break-words">
            {stock.market_capitalization}
          </Text5>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mr-2 justify-end">
          <Button1 onClick={() => onTrade?.(stock.symbol)}>
            <TrendingUp />
            Trade
          </Button1>
          <Button2 onClick={() => onRemove?.(stock.symbol)}>
            <X />
            Remove
          </Button2>
        </div>
      </div>
    </Tile>
  );
}