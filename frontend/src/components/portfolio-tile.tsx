import { TrendingUp, Plus, X } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";
import { formatMoney } from "@/lib/format-money";

interface PortfolioPosition {
  symbol: string;
  shares: number;
  current_price: number;
  previous_price: number;
  average_price: number;
  price_at_selected_range?: number;
  company_name?: string;
}

interface PortfolioTileProps {
  position: PortfolioPosition;
  onTrade?: (symbol: string) => void;
  onAddToWatchlist?: (symbol: string) => void;
  onRemoveFromWatchlist?: (symbol: string) => void;
  isInWatchlist?: boolean;
  showWatchlistButton?: boolean;
  totalPortfolioValue?: number;
}

export function PortfolioTile({
  position,
  onTrade,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist = false,
  showWatchlistButton = false,
  totalPortfolioValue
}: PortfolioTileProps) {

  const marketValue = position.shares * position.current_price;
  const portfolioPercentage = totalPortfolioValue && totalPortfolioValue > 0 
    ? (marketValue / totalPortfolioValue) * 100 
    : 0;

  return (
    <Tile>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] lg:items-center gap-4 w-full text-left">
        {/* Symbol & Company Name */}
        <div className="ml-2">
          <Text6>{position.symbol}</Text6>
          {position.company_name && (
            <Text4 className="text-muted-foreground break-words">{position.company_name}</Text4>
          )}
        </div>

        {/* Quantity */}
        <div className="text-left">
          <Text4>Quantity</Text4>
          <Text5 className="break-words">{position.shares}</Text5>
        </div>

        {/* Average Price */}
        <div className="text-left">
          <Text4>Average Price</Text4>
          <Text5 className="break-words">
            {formatMoney(position.average_price)}
          </Text5>
        </div>

        {/* Current Price */}
        <div className="text-left">
          <Text4>Current Price</Text4>
          <Text5 className="break-words">
            {formatMoney(position.current_price)}
          </Text5>
        </div>

        {/* Market Value */}
        <div className="text-left">
          <Text4>Market Value</Text4>
          <Text5 className="break-words">
            {formatMoney(marketValue)}
          </Text5>
        </div>

        {/* % of Portfolio */}
        <div className="text-left">
          <Text4>% of Portfolio</Text4>
          <Text5 className="break-words">
            {portfolioPercentage.toFixed(2)}%
          </Text5>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mr-2 justify-end">
          <Button1 onClick={() => onTrade?.(position.symbol)}>
            <TrendingUp />
            Trade
          </Button1>
          {showWatchlistButton && (
            isInWatchlist ? (
              <Button2 onClick={() => onRemoveFromWatchlist?.(position.symbol)} className="!w-32">
                <X />
                Remove
              </Button2>
            ) : (
              <Button2 onClick={() => onAddToWatchlist?.(position.symbol)} className="!w-32">
                <Plus />
                Add
              </Button2>
            )
          )}
        </div>
      </div>
    </Tile>
  );
}