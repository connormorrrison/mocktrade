import { useState } from "react";
import { Tile } from "@/components/tile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { PrimaryTitle } from "@/components/primary-title";
import { SecondaryTitle } from "@/components/secondary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
import { PrimaryButton } from "@/components/primary-button";

export default function PortfolioPage() {
  // Mock data to match the original structure
  const cashBalance = 12450.32;
  const totalPortfolioValue = 127450.32;
  const startingPortfolioValue = 100000;
  const cumulativeReturn = ((totalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) * 100;
  const [selectedRange, setSelectedRange] = useState("1mo");

  const positions = [
    {
      symbol: "AAPL",
      shares: 50,
      current_price: 150.25,
      average_price: 145.00,
      previous_price: 148.50,
      created_at: "2024-12-15T00:00:00Z",
      price_at_selected_range: 142.80
    },
    {
      symbol: "GOOGL",
      shares: 25,
      current_price: 2750.80,
      average_price: 2650.00,
      previous_price: 2735.20,
      created_at: "2024-12-10T00:00:00Z",
      price_at_selected_range: 2680.50
    },
    {
      symbol: "TSLA",
      shares: 100,
      current_price: 245.60,
      average_price: 270.00,
      previous_price: 250.30,
      created_at: "2024-12-05T00:00:00Z",
      price_at_selected_range: 272.40
    }
  ];

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full" style={{ marginTop: '0px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <PrimaryTitle>Portfolio</PrimaryTitle>
          
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="space-y-2">
              <SecondaryTitle>Account Summary</SecondaryTitle>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <TertiaryTitle>Total Portfolio Value</TertiaryTitle>
                  <p className="text-4xl font-semibold">
                    {formatMoney(totalPortfolioValue)}
                  </p>
                </div>
                <div>
                  <TertiaryTitle>Cash Balance</TertiaryTitle>
                  <p className="text-2xl font-semibold">
                    {formatMoney(cashBalance)}
                  </p>
                </div>
                <div>
                  <TertiaryTitle>Cumulative Return ({selectedRange})</TertiaryTitle>
                  <p className={`text-2xl font-semibold ${cumulativeReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {cumulativeReturn >= 0 ? `+${cumulativeReturn.toFixed(2)}%` : `${cumulativeReturn.toFixed(2)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio History Section */}
            <div>
              <SecondaryTitle>Performance</SecondaryTitle>
              <div className="mb-4">
                <TertiaryTitle className="mb-2">Range</TertiaryTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-zinc-700 !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                    {selectedRange === "1mo" && "1 Month"}
                    {selectedRange === "3mo" && "3 Months"}
                    {selectedRange === "6mo" && "6 Months"}
                    {selectedRange === "1y" && "1 Year"}
                    {selectedRange === "max" && "Max"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedRange("1mo")} className="text-base">
                      1 Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRange("3mo")} className="text-base">
                      3 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRange("6mo")} className="text-base">
                      6 Months
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRange("1y")} className="text-base">
                      1 Year
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedRange("max")} className="text-base">
                      Max
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-400">Portfolio History Chart (Mock)</p>
              </div>
              <TertiaryTitle className="mt-2">
                Note: Historical data includes only completed trading days.
              </TertiaryTitle>
            </div>

            {/* Holdings */}
            <div>
              <SecondaryTitle className="pb-2">Holdings</SecondaryTitle>
              <div className="space-y-6">
                {positions.map((pos) => {
                  const effectivePurchasePrice = pos.price_at_selected_range || pos.average_price;
                  const gainSinceRange = (pos.current_price - effectivePurchasePrice) * pos.shares;
                  const gainPercentSinceRange = effectivePurchasePrice > 0 
                    ? ((pos.current_price - effectivePurchasePrice) / effectivePurchasePrice) * 100 
                    : 0;
                  
                  const dailyPL = (pos.current_price - pos.previous_price) * pos.shares;
                  const dailyPercent = pos.previous_price > 0 
                    ? ((pos.current_price - pos.previous_price) / pos.previous_price) * 100 
                    : 0;
                  
                  const currentValue = pos.shares * pos.current_price;

                  return (
                    <Tile key={pos.symbol}>
                      <div className="flex justify-between items-center">
                        {/* Symbol & Shares */}
                        <div>
                          <p className="text-lg font-semibold ml-2">{pos.symbol}</p>
                          <TertiaryTitle className="ml-2">
                            {pos.shares} {pos.shares === 1 ? "share" : "shares"}
                          </TertiaryTitle>
                        </div>

                        {/* Current Price */}
                        <div className="text-right">
                          <TertiaryTitle>Current Price</TertiaryTitle>
                          <p className="font-medium">{formatMoney(pos.current_price)}</p>
                        </div>

                        {/* Current Value */}
                        <div className="text-right">
                          <TertiaryTitle>Current Value</TertiaryTitle>
                          <p className="font-medium">{formatMoney(currentValue)}</p>
                        </div>

                        {/* Gain */}
                        <div className="text-right">
                          <TertiaryTitle>Gain ({selectedRange})</TertiaryTitle>
                          <p className={`font-medium ${gainSinceRange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {gainSinceRange >= 0 ? "+" : ""}{formatMoney(gainSinceRange)}{" "}
                            <span className={`font-medium ${gainSinceRange >= 0 ? "text-green-600" : "text-red-600"}`}>
                              ({gainPercentSinceRange >= 0 ? "+" : ""}{gainPercentSinceRange.toFixed(2)}%)
                            </span>
                          </p>
                        </div>

                        {/* Daily P/L */}
                        <div className="text-right">
                          <TertiaryTitle className="mr-2">Daily P/L</TertiaryTitle>
                          <p className={`font-medium mr-2 ${dailyPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {dailyPL >= 0 ? "+" : ""}{formatMoney(dailyPL)}{" "}
                            <span className={`font-medium ${dailyPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                              ({dailyPercent >= 0 ? "+" : ""}{dailyPercent.toFixed(2)}%)
                            </span>
                          </p>
                        </div>

                        {/* Trade Button */}
                        <div className="text-right">
                          <PrimaryButton className="mr-2">
                            Trade
                          </PrimaryButton>
                        </div>
                      </div>
                    </Tile>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  );
}