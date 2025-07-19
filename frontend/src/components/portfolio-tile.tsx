import { TrendingUp } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";

interface PortfolioPosition {
  symbol: string;
  shares: number;
  current_price: number;
  previous_price: number;
  average_price: number;
  price_at_selected_range?: number;
}

interface PortfolioTileProps {
  position: PortfolioPosition;
  filterLabel: string;
  onTrade?: (symbol: string) => void;
}

export function PortfolioTile({
  position,
  filterLabel,
  onTrade
}: PortfolioTileProps) {
  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  const effectivePurchasePrice = position.price_at_selected_range || position.average_price;
  const gainSinceRange = (position.current_price - effectivePurchasePrice) * position.shares;
  const gainPercentSinceRange = effectivePurchasePrice > 0
    ? ((position.current_price - effectivePurchasePrice) / effectivePurchasePrice) * 100
    : 0;

  const dailyPL = (position.current_price - position.previous_price) * position.shares;
  const dailyPercent = position.previous_price > 0
    ? ((position.current_price - position.previous_price) / position.previous_price) * 100
    : 0;

  const currentValue = position.shares * position.current_price;

  return (
    <Tile>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_2fr_2fr_2fr_auto] lg:items-center gap-4 w-full text-left">
        {/* Symbol & Shares */}
        <div className="ml-2">
          <Text6>{position.symbol}</Text6>
          <Text4 className="break-words">{position.shares} {position.shares === 1 ? 'share' : 'shares'}</Text4>
        </div>

        {/* Current Price */}
        <div className="text-left">
          <Text4>Current Price</Text4>
          <Text5 className="break-words">
            {formatMoney(position.current_price)}
          </Text5>
        </div>

        {/* Current Value */}
        <div className="text-left">
          <Text4>Current Value</Text4>
          <Text5 className="break-words">
            {formatMoney(currentValue)}
          </Text5>
        </div>

        {/* Gain */}
        <div className="text-left">
          <Text4>Gain ({filterLabel})</Text4>
          <Text5 variant={gainSinceRange >= 0 ? "green" : "red"} className="break-words">
            {gainSinceRange >= 0 ? "+" : ""}
            {formatMoney(gainSinceRange)}{" "}
            ({gainPercentSinceRange >= 0 ? "+" : ""}
            {gainPercentSinceRange.toFixed(2)}%)
          </Text5>
        </div>

        {/* Daily P/L */}
        <div className="text-left">
          <Text4>Daily P/L</Text4>
          <Text5 variant={dailyPL >= 0 ? "green" : "red"} className="break-words">
            {dailyPL >= 0 ? "+" : ""}
            {formatMoney(dailyPL)}{" "}
            ({dailyPercent >= 0 ? "+" : ""}
            {dailyPercent.toFixed(2)}%)
          </Text5>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mr-2 justify-end">
          <Button1 onClick={() => onTrade?.(position.symbol)}>
            <TrendingUp />
            Trade
          </Button1>
        </div>
      </div>
    </Tile>
  );
}