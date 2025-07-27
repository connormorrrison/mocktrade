import { Tile } from "@/components/tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { MarketStatus } from "@/components/market-status";
import { formatMoney } from "@/lib/format-money";
import { PopInOutEffect } from "@/components/pop-in-out-effect";

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
  isMarketOpen,
  error
}: StockPriceDisplayProps) => {
  const shouldShow = !!(symbol && price && !error && price !== 0);

  return (
    <PopInOutEffect isVisible={shouldShow}>
      <Tile>
        <div className="flex sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <Text5>
              {companyName}
            </Text5>
            <Text4>
              Market price for {symbol}
            </Text4>
            <Text2 className={isMarketOpen ? "animate-pulse" : ""}>
              {formatMoney(price!)}
            </Text2>
            {sharesOwned > 0 && (
              <Text4>
                You own {sharesOwned.toLocaleString()}{' '}
                {sharesOwned === 1 ? 'share' : 'shares'}
              </Text4>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Text4>Status</Text4>
            <div className="flex justify-end">
              <MarketStatus />
            </div>
          </div>
        </div>
      </Tile>
    </PopInOutEffect>
  );
};