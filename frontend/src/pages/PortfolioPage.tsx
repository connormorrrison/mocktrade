import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PortfolioTile } from "@/components/portfolio-tile";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { formatMoney } from "@/lib/format-money";

export default function PortfolioPage() {
  // Mock data to match the original structure
  const cashBalance = 12450.32;
  const totalPortfolioValue = 127450.32;
  const startingPortfolioValue = 100000;
  const cumulativeReturn =
    ((totalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) *
    100;
  
  // Mock transaction count for the overview component
  const mockTransactionCount = 15;
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


  return (
    <PageLayout title="Portfolio">
        <div className="space-y-2">
          <Title2>Overview</Title2>
          <UserProfileTiles
            totalValue={totalPortfolioValue}
            cashBalance={cashBalance}
            transactionCount={mockTransactionCount}
          />
        </div>

        {/* Portfolio History Section */}
        <div>
          <Title2>Performance</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <CustomDropdown
              label="Filter"
              value={selectedFilter === "1mo" ? "1 Month" : selectedFilter === "3mo" ? "3 Months" : selectedFilter === "6mo" ? "6 Months" : selectedFilter === "1y" ? "1 Year" : "Max"}
              options={[
                { value: "1mo", label: "1 Month" },
                { value: "3mo", label: "3 Months" },
                { value: "6mo", label: "6 Months" },
                { value: "1y", label: "1 Year" },
                { value: "max", label: "Max" },
              ]}
              onValueChange={setSelectedFilter}
            />
          </div>
          <Tile>
            <PortfolioChart />
          </Tile>
        </div>

        {/* Positions */}
        <div>
          <Title2>Positions</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <CustomDropdown
              label="Sort By"
              value={sortBy === "symbol" ? "Symbol" : sortBy === "value" ? "Current Value" : sortBy === "gain" ? "Gain" : "Daily P/L"}
              options={[
                { value: "symbol", label: "Symbol" },
                { value: "value", label: "Current Value" },
                { value: "gain", label: "Gain" },
                { value: "daily", label: "Daily P/L" },
              ]}
              onValueChange={setSortBy}
            />
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
              .map((pos) => (
                <PortfolioTile
                  key={pos.symbol}
                  position={pos}
                  filterLabel={filterLabels[selectedFilter]}
                />
              ))}
          </div>
        </div>
    </PageLayout>
  );
}