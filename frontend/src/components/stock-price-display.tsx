import { useState, useEffect } from "react";
import { Tile } from "@/components/tile";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
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
  isMarketOpen,
  error
}: StockPriceDisplayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const shouldShow = symbol && price && !error && price !== 0;

  useEffect(() => {
    if (shouldShow && !isVisible) {
      // Show with enter animation
      setIsVisible(true);
      setIsExiting(false);
    } else if (!shouldShow && isVisible) {
      // Hide with exit animation
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [shouldShow, isVisible]);

  if (!isVisible) return null;

  return (
    <Tile 
      className={`
        ${!isExiting 
          ? "animate-in zoom-in-95 fade-in duration-200 ease-out" 
          : "animate-out zoom-out-95 fade-out duration-200 ease-in"
        }
      `}
    >
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
  );
};