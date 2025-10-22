import { Tile } from "@/components/tile";
import { Text2 } from "@/components/text-2";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { MarketStatus } from "@/components/market-status";
import { WatchlistButton } from "@/components/watchlist-button";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";

interface StockPriceDisplayProps {
  symbol: string;
  price: number | null;
  companyName: string;
  sharesOwned: number;
  isMarketOpen: boolean;
  error: string | null;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  isInWatchlist: boolean;
}

export const StockPriceDisplay = ({
  symbol,
  price,
  companyName,
  sharesOwned,
  isMarketOpen,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist
}: StockPriceDisplayProps) => {
  return (
    <Tile>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center gap-4 w-full text-left">
        {/* Company Name & Symbol with Price and Shares */}
        <div className="ml-2">
          <Text6>
            {companyName} <span className="text-muted-foreground ml-2">{symbol}</span>
          </Text6>
          <Text2 className={cn(isMarketOpen && "animate-pulse")}>
            {formatMoney(price!)}
          </Text2>
          <Text5>
            {sharesOwned.toLocaleString()} {sharesOwned === 1 ? 'share' : 'shares'} owned
          </Text5>
        </div>

        {/* Empty spacing columns */}
        <div className="text-left flex items-center">
        </div>

        <div className="text-left flex items-center">
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mr-2 justify-end">
          <MarketStatus />
          <WatchlistButton
            symbol={symbol}
            isInWatchlist={isInWatchlist}
            onAddToWatchlist={onAddToWatchlist}
            onRemoveFromWatchlist={onRemoveFromWatchlist}
          />
        </div>
      </div>
    </Tile>
  );
};