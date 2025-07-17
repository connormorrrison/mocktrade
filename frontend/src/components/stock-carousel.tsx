import { useState, useEffect } from "react";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text5 } from "@/components/text-5";
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Get 4 stocks for the carousel (3 visible + 1 coming up from bottom)
  const getVisibleStocks = () => {
    const visibleStocks = [];
    for (let i = 0; i < 4; i++) {
      visibleStocks.push(stocks[(currentIndex + i) % stocks.length]);
    }
    return visibleStocks;
  };

  const visibleStocks = getVisibleStocks();

  // Cycle through stocks every 2 seconds with carousel animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % stocks.length);
        setIsAnimating(false);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, [stocks.length]);

  const formatChange = (change: number) => {
    return variant === "green" 
      ? `+${change.toFixed(2)}%` 
      : `${change.toFixed(2)}%`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="relative h-[228px] overflow-hidden">
      {visibleStocks.map((stock, i) => (
        <div
          key={`${stock.symbol}-${currentIndex}`}
          className={`absolute w-full transition-all duration-500 ease-in-out ${
            i >= 3 ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transform: isAnimating 
              ? i === 0 
                ? 'translateY(-100%) scale(0.9)' 
                : i === 3
                ? `translateY(${2 * 76}px) scale(1.0)`
                : `translateY(${(i-1) * 76}px)`
              : i === 3
              ? `translateY(${3 * 76}px) scale(0.9)`
              : `translateY(${i * 76}px)`,
            opacity: isAnimating 
              ? i === 0 
                ? 0 
                : i === 3
                ? 1
                : 1
              : i >= 3 ? 0 : 1,
            scale: isAnimating 
              ? i === 0 
                ? 0.9 
                : i === 3
                ? 1.0
                : 1
              : i === 3 ? 0.9 : 1
          }}
        >
          <Tile>
            <div className="flex justify-between items-center">
              <Text3>{stock.symbol}</Text3>
              <Text5>{formatPrice(stock.price)}</Text5>
              <Text5 variant={variant}>{formatChange(stock.change)}</Text5>
            </div>
          </Tile>
        </div>
      ))}
    </div>
  );
}