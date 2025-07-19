import { useState, useEffect } from "react";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";

interface Stock {
  symbol: string;
  change: number;
  price: number;
}

interface StockCarouselProps {
  stocks: Stock[];
  variant: "green" | "red";
}

export function StockCarousel({ stocks, variant }: StockCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Return early if there aren't enough stocks to cycle
    if (stocks.length <= 3) return;

    const interval = setInterval(() => {
      // By incrementing the index, we trigger a re-render.
      // The new styles will be animated by the CSS transition.
      setCurrentIndex((prev) => (prev + 1) % stocks.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [stocks.length]);

  const formatChange = (change: number) => {
    return variant === "green"
      ? `+${change.toFixed(2)}%`
      : `${change.toFixed(2)}%`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const tileHeight = 76; // The height of a single tile in pixels

  return (
    <div className="relative h-[228px] overflow-hidden">
      {stocks.map((stock, index) => {
        // This is the corrected position calculation. As `currentIndex` increases,
        // the position for a given stock also increases, causing it to move down.
        let position = currentIndex - index;

        // This logic handles the "wrap-around" for a seamless loop.
        // For example, it ensures the last item appears above the first.
        const half = stocks.length / 2;
        if (position > half) {
          position -= stocks.length;
        } else if (position < -half) {
          position += stocks.length;
        }
        
        // Logical positions:
        // -1: Entering from above (invisible)
        //  0: Top slot
        //  1: Middle slot
        //  2: Bottom slot
        //  3: Exiting below (invisible)
        
        // For performance, we only render items near the viewport
        if (position < -1 || position > 3) {
          return null;
        }

        const style = {
          // The `position` directly maps to the vertical offset.
          transform: `translateY(${position * tileHeight}px)`,
          // Items are only visible when in the main three slots.
          opacity: position >= 0 && position <= 2 ? 1 : 0,
          // The transition is always active to animate any style changes.
          transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
        };

        return (
          <div key={stock.symbol} className="absolute w-full" style={style}>
            <Tile>
              <div className="flex justify-between items-center">
                <Text6>{stock.symbol}</Text6>
                <Text5>{formatPrice(stock.price)}</Text5>
                <Text5 variant={variant}>{formatChange(stock.change)}</Text5>
              </div>
            </Tile>
          </div>
        );
      })}
    </div>
  );
}