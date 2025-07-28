import { Tile } from "@/components/tile";
import { Text2 } from "@/components/text-2";
import { Text5 } from "@/components/text-5";
import { MarketStatus } from "@/components/market-status";
import { formatMoney } from "@/lib/format-money";

interface StockPriceDisplayProps {
  symbol: string;
  price: number | null;
  companyName: string;
  sharesOwned: number;
  isMarketOpen: boolean;
  error: string | null;
}

export const StockPriceDisplay = ({
  symbol,
  price,
  companyName,
  sharesOwned,
  isMarketOpen
}: StockPriceDisplayProps) => {
  return (
    <Tile>
      <div className="flex justify-between items-center">
        <div>
          <Text5>{companyName} ({symbol})</Text5>
          <Text2 className={isMarketOpen ? "animate-pulse" : ""}>
            {formatMoney(price!)}
          </Text2>
          <Text5>
            {sharesOwned.toLocaleString()} {sharesOwned === 1 ? 'share' : 'shares'} owned
          </Text5>
        </div>
        <MarketStatus />
      </div>
    </Tile>
  );
};