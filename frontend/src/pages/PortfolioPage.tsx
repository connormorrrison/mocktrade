import { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { Text1 } from "@/components/text-1";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PortfolioPage() {
  // Mock data to match the original structure
  const cashBalance = 12450.32;
  const totalPortfolioValue = 127450.32;
  const startingPortfolioValue = 100000;
  const cumulativeReturn =
    ((totalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) *
    100;
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");

  const positions = [
    {
      symbol: "AAPL",
      shares: 50,
      current_price: 150.25,
      average_price: 145.0,
      previous_price: 148.5,
      created_at: "2024-12-15T00:00:00Z",
      price_at_selected_range: 142.8,
    },
    {
      symbol: "GOOGL",
      shares: 25,
      current_price: 2750.8,
      average_price: 2650.0,
      previous_price: 2735.2,
      created_at: "2024-12-10T00:00:00Z",
      price_at_selected_range: 2680.5,
    },
    {
      symbol: "TSLA",
      shares: 100,
      current_price: 245.6,
      average_price: 270.0,
      previous_price: 250.3,
      created_at: "2024-12-05T00:00:00Z",
      price_at_selected_range: 272.4,
    },
  ];

  // Map for dynamic labels
  const filterLabels: { [key: string]: string } = {
    "1mo": "1mo",
    "3mo": "3mo",
    "6mo": "6mo",
    "1y": "1y",
    "max": "Max",
  };

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  return (
    <PageLayout title="Portfolio">
      <div className="space-y-6">
        {/* Account Summary */}
        <div className="space-y-2">
          <Title2>Account Summary</Title2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <Text4>Total Portfolio Value</Text4>
              <Text1>{formatMoney(totalPortfolioValue)}</Text1>
            </div>
            <div>
              <Text4>Cash Balance</Text4>
              <Text2>{formatMoney(cashBalance)}</Text2>
            </div>
            <div>
              <Text4>Cumulative Return (1mo)</Text4>
              <Text2
                className={`${
                  cumulativeReturn >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {cumulativeReturn >= 0
                  ? `+${cumulativeReturn.toFixed(2)}%`
                  : `${cumulativeReturn.toFixed(2)}%`}
              </Text2>
            </div>
          </div>
        </div>

        {/* Portfolio History Section */}
        <div>
          <Title2>Performance</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <Title3 className="px-1">Filter</Title3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                {selectedFilter === "1mo" && "1 Month"}
                {selectedFilter === "3mo" && "3 Months"}
                {selectedFilter === "6mo" && "6 Months"}
                {selectedFilter === "1y" && "1 Year"}
                {selectedFilter === "max" && "Max"}
                <ChevronDown className="h-5 w-5 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("1mo")}
                  className="text-base"
                >
                  1 Month
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("3mo")}
                  className="text-base"
                >
                  3 Months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("6mo")}
                  className="text-base"
                >
                  6 Months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("1y")}
                  className="text-base"
                >
                  1 Year
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("max")}
                  className="text-base"
                >
                  Max
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Tile>
            <PortfolioChart />
          </Tile>
          <Title3 className="mt-2">
            Note: Historical data includes only completed trading days.
          </Title3>
        </div>

        {/* Holdings */}
        <div>
          <Title2 className="pb-2">Holdings</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <Title3 className="px-1">Sort By</Title3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                {sortBy === "symbol" && "Symbol"}
                {sortBy === "value" && "Current Value"}
                {sortBy === "gain" && "Gain"}
                {sortBy === "daily" && "Daily P/L"}
                <ChevronDown className="h-5 w-5 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setSortBy("symbol")}
                  className="text-base"
                >
                  Symbol
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("value")}
                  className="text-base"
                >
                  Current Value
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("gain")}
                  className="text-base"
                >
                  Gain
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("daily")}
                  className="text-base"
                >
                  Daily P/L
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {positions
              .sort((a, b) => {
                switch (sortBy) {
                  case "symbol":
                    return a.symbol.localeCompare(b.symbol);
                  case "value":
                    return (b.shares * b.current_price) - (a.shares * a.current_price);
                  case "gain":
                    const aGain = (a.current_price - (a.price_at_selected_range || a.average_price)) * a.shares;
                    const bGain = (b.current_price - (b.price_at_selected_range || b.average_price)) * b.shares;
                    return bGain - aGain;
                  case "daily":
                    const aDailyPL = (a.current_price - a.previous_price) * a.shares;
                    const bDailyPL = (b.current_price - b.previous_price) * b.shares;
                    return bDailyPL - aDailyPL;
                  default:
                    return 0;
                }
              })
              .map((pos) => {
              const effectivePurchasePrice =
                pos.price_at_selected_range || pos.average_price;
              const gainSinceRange =
                (pos.current_price - effectivePurchasePrice) * pos.shares;
              const gainPercentSinceRange =
                effectivePurchasePrice > 0
                  ? ((pos.current_price - effectivePurchasePrice) /
                      effectivePurchasePrice) *
                    100
                  : 0;

              const dailyPL =
                (pos.current_price - pos.previous_price) * pos.shares;
              const dailyPercent =
                pos.previous_price > 0
                  ? ((pos.current_price - pos.previous_price) /
                      pos.previous_price) *
                    100
                  : 0;

              const currentValue = pos.shares * pos.current_price;

              return (
                <Tile key={pos.symbol}>
                  {/* CHANGE: Reduced vertical padding (py-4) and gap (gap-y-4) to decrease height. */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="lg:text-left">
                      <p className="text-lg font-medium ml-2">{pos.symbol}</p>
                      <Text4 className="ml-2">
                        {pos.shares} {pos.shares === 1 ? "share" : "shares"}
                      </Text4>
                    </div>

                    {/* CHANGE: Removed `lg:text-center` to make text left-aligned. */}
                    <div>
                      <Text4>Current Price</Text4>
                      <p className="font-medium">
                        {formatMoney(pos.current_price)}
                      </p>
                    </div>

                    {/* CHANGE: Removed `lg:text-center` to make text left-aligned. */}
                    <div>
                      <Text4>Current Value</Text4>
                      <p className="font-medium">
                        {formatMoney(currentValue)}
                      </p>
                    </div>

                    {/* CHANGE: Removed `lg:text-center` to make text left-aligned. */}
                    <div>
                      <Text4>Gain ({filterLabels[selectedFilter]})</Text4>
                      <p
                        className={`font-medium ${
                          gainSinceRange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {gainSinceRange >= 0 ? "+" : ""}
                        {formatMoney(gainSinceRange)}{" "}
                        <span
                          className={`font-medium ${
                            gainSinceRange >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          (
                          {gainPercentSinceRange >= 0
                            ? "+"
                            : ""}
                          {gainPercentSinceRange.toFixed(2)}
                          %)
                        </span>
                      </p>
                    </div>

                    {/* CHANGE: Removed `lg:text-center` to make text left-aligned. */}
                    <div>
                      <Text4>Daily P/L</Text4>
                      <p
                        className={`font-medium ${
                          dailyPL >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {dailyPL >= 0 ? "+" : ""}
                        {formatMoney(dailyPL)}{" "}
                        <span
                          className={`font-medium ${
                            dailyPL >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ({dailyPercent >= 0 ? "+" : ""}
                          {dailyPercent.toFixed(2)}
                          %)
                        </span>
                      </p>
                    </div>

                    <div className="lg:mr-2">
                      <Button1>
                        <TrendingUp />
                        Trade
                      </Button1>
                    </div>
                  </div>
                </Tile>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}