import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";
import { formatMoney } from "@/lib/format-money";

interface Stock {
  symbol: string;
  name: string;
  change: number;
  change_percent: number;
  price: number;
}

interface StockCarouselProps {
  stocks: Stock[];
  variant: "green" | "red";
}

export function StockCarousel({ stocks, variant }: StockCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tileRef = useRef<HTMLDivElement>(null);
  const [tileHeight, setTileHeight] = useState(0);

  useEffect(() => {
    if (stocks.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stocks.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [stocks.length]);

  useEffect(() => {
    if (tileRef.current) {
      const tileElement = tileRef.current;
      const style = getComputedStyle(tileElement);
      const height = tileElement.getBoundingClientRect().height; // Includes padding and borders
      const marginTop = parseFloat(style.marginTop);
      const marginBottom = parseFloat(style.marginBottom);
      const gap = parseFloat(
        getComputedStyle(tileElement.parentElement!).getPropertyValue("--gap") || "0"
      );

      // Total height is the tile's height plus its vertical margins
      const totalHeight = height + marginTop + marginBottom;
      // When gap is 0, we only use the tile's height unless margins are present
      const effectiveHeight = gap === 0 ? height : totalHeight + gap;

      setTileHeight(effectiveHeight);
    }
  }, [stocks]);

  const formatChange = (stock: Stock) => {
    const isPositive = stock.change >= 0;
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUp className="h-5 w-5" />
        ) : (
          <ArrowDown className="h-5 w-5" />
        )}
        <span>
          {isPositive ? "+" : ""}
          {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
          {stock.change_percent.toFixed(2)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="relative h-75 overflow-hidden" style={{ "--gap": "18rem" } as React.CSSProperties}>
      {stocks.map((stock, index) => {
        let position = currentIndex - index;
        const half = stocks.length / 2;
        if (position > half) {
          position -= stocks.length;
        } else if (position < -half) {
          position += stocks.length;
        }

        if (position < -1 || position > 3) {
          return null;
        }

        const style = {
          transform: `translateY(${position * tileHeight}px)`,
          opacity: position >= 0 && position <= 2 ? 1 : 0,
          transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
        };

        return (
          <div
            key={stock.symbol}
            className="absolute w-full"
            style={style}
            ref={index === 0 ? tileRef : null}
          >
            <Tile className="flex items-center">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-4 w-full">
                <div className="flex justify-between items-center sm:block">
                  <div className="flex flex-col">
                    <Text6 className="whitespace-nowrap">{stock.symbol}</Text6>
                    <Text4 className="truncate">{stock.name}</Text4>
                  </div>
                  <Text5 className="sm:hidden whitespace-nowrap">{formatMoney(stock.price)}</Text5>
                </div>
                <div className="hidden sm:flex sm:gap-4 sm:items-center">
                  <Text5 className="whitespace-nowrap">{formatMoney(stock.price)}</Text5>
                  <Text5 variant={variant} className="whitespace-nowrap">
                    {formatChange(stock)}
                  </Text5>
                </div>
                <Text5 variant={variant} className="sm:hidden text-right whitespace-nowrap">
                  {formatChange(stock)}
                </Text5>
              </div>
            </Tile>
          </div>
        );
      })}
    </div>
  );
}