import { TrendingUp } from "lucide-react";
import { Button1 } from "@/components/Button1";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Text4 } from "@/components/Text4";
import { Text5 } from "@/components/Text5";
import { Text6 } from "@/components/Text6";
import { Tile } from "@/components/Tile";
import { formatMoney } from "@/lib/formatMoney";

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
  onAddToWatchlist?: (symbol: string) => void;
  removing?: boolean;
}

export function WatchlistTile({ stock, onTrade, onRemove, onAddToWatchlist, removing }: WatchlistTileProps) {

  const dailyChange = stock.current_price - stock.previous_price;
  const dailyPercent = stock.previous_price > 0 
    ? ((stock.current_price - stock.previous_price) / stock.previous_price) * 100 
    : 0;

  return (
    <Tile>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center gap-4 w-full text-left">
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

        {/* Change (Daily) */}
        <div className="text-left">
          <Text4>Change (Daily)</Text4>
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
          {onRemove && onAddToWatchlist && (
            <WatchlistButton
              symbol={stock.symbol}
              isInWatchlist={true}
              onAddToWatchlist={onAddToWatchlist}
              onRemoveFromWatchlist={onRemove}
              removing={removing}
            />
          )}
        </div>
      </div>
    </Tile>
  );
}