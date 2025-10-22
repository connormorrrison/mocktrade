import React from 'react';
// 1. import link from react-router-dom
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Text6 } from "@/components/text-6";
import { Tile } from "@/components/tile";
import { formatMoney } from "@/lib/format-money";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// component prop types
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
  isMarketOpen?: boolean;
}

/**
 * a vertical carousel that cycles through a list of stocks,
 * built with shadcn/ui Carousel and Embla Autoplay.
 */
export function StockCarousel({ stocks, variant, isMarketOpen = false }: StockCarouselProps) {

  // helper to format the change string
  const formatChange = (stock: Stock) => {
    const isPositive = stock.change >= 0;
    
    let changeIcon: React.ReactNode;
    let sign: string;

    if (isPositive) {
      changeIcon = <ArrowUp className="h-5 w-5" />;
      sign = "+";
    } else {
      changeIcon = <ArrowDown className="h-5 w-5" />;
      sign = ""; // minus is already on the number
    }

    const changeString = sign + stock.change.toFixed(2);
    const percentString = "(" + sign + stock.change_percent.toFixed(2) + "%)";
    const fullChangeText = changeString + " " + percentString;

    return (
      <div className="flex items-center gap-1">
        {changeIcon}
        <span>
          {fullChangeText}
        </span>
      </div>
    );
  };

  return (
    <Carousel
      className="w-full"
      orientation="vertical"
      plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: false, // ensures clicking doesn't stop autoplay
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent className="h-96 -mt-4">
        {stocks.slice().reverse().map((stock) => {

          // --- derive dynamic class names ---
          let pricePulseClass: string;
          if (isMarketOpen) {
            pricePulseClass = "animate-pulse";
          } else {
            pricePulseClass = "";
          }
          
          const mobilePriceClasses = "sm:hidden " + pricePulseClass;
          const desktopPriceClasses = "whitespace-nowrap " + pricePulseClass;
          // ---

          const tradeUrl = "/trade/" + stock.symbol;

          return (
            <CarouselItem 
              key={stock.symbol} 
              className="pt-4 basis-1/4"
            >
              
              {/* 2. wrap the tile in a link component */}
              <Link to={tradeUrl} className="block h-full">
                <Tile className="flex items-center h-20 p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:gap-4 w-full">
                    
                    {/* section 1: info (symbol, name, and mobile price) */}
                    <div className="flex justify-between items-center sm:block sm:min-w-0">
                      
                      <div className="flex flex-col min-w-0"> 
                        <Text6 className="">{stock.symbol}</Text6>
                        <Text4 className="truncate">{stock.name}</Text4> 
                      </div>
                      
                      <Text5 className={mobilePriceClasses}>{formatMoney(stock.price)}</Text5>
                    </div>

                    {/* section 2: desktop price and change */}
                    <div className="hidden sm:flex sm:gap-4 sm:items-center">
                      <Text5 className={desktopPriceClasses}>{formatMoney(stock.price)}</Text5>
                      <Text5 variant={variant} className="whitespace-nowrap">
                        {formatChange(stock)}
                      </Text5>
                    </div>

                    {/* section 3: mobile change */}
                    <Text5 variant={variant} className="sm:hidden text-right">
                      {formatChange(stock)}
                    </Text5>
                  </div>
                </Tile>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}