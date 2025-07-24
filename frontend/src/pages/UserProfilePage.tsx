import { useParams } from "react-router-dom";
import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { TransactionsTable } from "@/components/transactions-table";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Text4 } from "@/components/text-4";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PortfolioTile } from "@/components/portfolio-tile";
import { UserProfileHeader } from "@/components/user-profile-header";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { Button2 } from "@/components/button-2";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");

  // Mock watchlist state (in a real app, this would come from context/API)
  const [watchlist, setWatchlist] = useState<string[]>([
    "AAPL", "GOOGL", "TSLA" // Mock some symbols already in watchlist
  ]);

  // Check if user exists (for 404 handling)
  const validUsernames = [
    "moonwalker2024", "cryptoninja47", "bullmarket_boss", "options_queen", 
    "dividend_hunter", "tech_wizard92", "value_seeker", "growth_master",
    "swing_king", "hodl_forever", "momentum_trader", "smart_money23",
    "risk_taker_99", "tech_bull_run", "steady_eddie", "portfolio_pro",
    "chart_analyst", "day_trader_x", "longterm_gains", "trade_master"
  ];

  if (!username || !validUsernames.includes(username)) {
    return (
      <PageLayout title="User Not Found">
        <div className="text-center py-12">
          <Title2>User Not Found</Title2>
          <Text4 className="mt-4">The user "{username}" does not exist.</Text4>
        </div>
      </PageLayout>
    );
  }

  // Mock user data based on username
  const getUserData = (username: string) => {
    const mockData = {
      moonwalker2024: {
        totalValue: 142350.75,
        cashBalance: 8230.50,
        return: 23.45,
        joinedDate: "2024-03-15T00:00:00Z",
        positions: [
          { symbol: "TSLA", company_name: "Tesla, Inc.", shares: 150, current_price: 245.6, average_price: 200.0, previous_price: 250.3, created_at: "2024-12-01T00:00:00Z", price_at_selected_range: 210.8 },
          { symbol: "NVDA", company_name: "NVIDIA Corporation", shares: 75, current_price: 520.8, average_price: 450.0, previous_price: 515.2, created_at: "2024-11-15T00:00:00Z", price_at_selected_range: 480.5 },
        ],
        transactions: [
          { id: 1, symbol: "TSLA", transaction_type: "BUY", shares: 150, price: 200.00, total_amount: 30000.00, created_at: "2024-12-01T10:30:00Z" },
          { id: 2, symbol: "NVDA", transaction_type: "BUY", shares: 75, price: 450.00, total_amount: 33750.00, created_at: "2024-11-15T14:15:00Z" },
        ]
      },
      cryptoninja47: {
        totalValue: 128940.25,
        cashBalance: 12450.75,
        return: 19.87,
        joinedDate: "2024-02-20T00:00:00Z",
        positions: [
          { symbol: "BTC", company_name: "Bitcoin", shares: 2, current_price: 45000.0, average_price: 38000.0, previous_price: 44500.0, created_at: "2024-10-01T00:00:00Z", price_at_selected_range: 40000.0 },
          { symbol: "ETH", company_name: "Ethereum", shares: 15, current_price: 2800.0, average_price: 2200.0, previous_price: 2750.0, created_at: "2024-10-15T00:00:00Z", price_at_selected_range: 2400.0 },
        ],
        transactions: [
          { id: 1, symbol: "BTC", transaction_type: "BUY", shares: 2, price: 38000.00, total_amount: 76000.00, created_at: "2024-10-01T09:00:00Z" },
          { id: 2, symbol: "ETH", transaction_type: "BUY", shares: 15, price: 2200.00, total_amount: 33000.00, created_at: "2024-10-15T11:30:00Z" },
        ]
      }
    };

    return mockData[username as keyof typeof mockData] || {
      totalValue: 110000.0,
      cashBalance: 5000.0,
      return: 10.0,
      joinedDate: "2024-01-01T00:00:00Z",
      positions: [
        { symbol: "SPY", company_name: "SPDR S&P 500 ETF Trust", shares: 100, current_price: 450.0, average_price: 400.0, previous_price: 448.0, created_at: "2024-01-01T00:00:00Z", price_at_selected_range: 420.0 },
      ],
      transactions: [
        { id: 1, symbol: "SPY", transaction_type: "BUY", shares: 100, price: 400.00, total_amount: 40000.00, created_at: "2024-01-01T10:00:00Z" },
      ]
    };
  };

  const userData = getUserData(username);


  // Watchlist functions
  const addToWatchlist = (symbol: string) => {
    setWatchlist(prev => [...prev, symbol]);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  const handleTrade = (symbol: string) => {
    // In a real app, this would navigate to trade page with the symbol
    console.log(`Navigate to trade page for ${symbol}`);
  };


  return (
    <PageLayout title="">
      <div className="flex flex-col gap-8">
        {/* Back Button */}
        <Link to="/leaderboard">
          <Button2>
            <ChevronLeft />
            Back
          </Button2>
        </Link>
        
        {/* Profile Header */}
        <UserProfileHeader 
          username={username!} 
          joinedDate={userData.joinedDate} 
        />

        {/* Overview Section */}
        <div className="space-y-2">
          <Title2>Overview</Title2>
          <UserProfileTiles
            totalValue={userData.totalValue}
            cashBalance={userData.cashBalance}
            transactionCount={userData.transactions.length}
          />
        </div>
      </div>

      {/* Portfolio Chart */}
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

      {/* Current Positions */}
      <div>
        <Title2>Positions</Title2>
        <div className="flex flex-col mb-4 w-full sm:w-fit">
          <CustomDropdown
            label="Sort By"
            value={sortBy === "symbol" ? "Symbol" : sortBy === "quantity" ? "Quantity" : sortBy === "avgPrice" ? "Average Price" : sortBy === "currentPrice" ? "Current Price" : sortBy === "marketValue" ? "Market Value" : "% of Portfolio"}
            options={[
              { value: "symbol", label: "Symbol" },
              { value: "quantity", label: "Quantity" },
              { value: "avgPrice", label: "Average Price" },
              { value: "currentPrice", label: "Current Price" },
              { value: "marketValue", label: "Market Value" },
              { value: "portfolio", label: "% of Portfolio" },
            ]}
            onValueChange={setSortBy}
          />
        </div>
        <div className="space-y-4">
          {userData.positions
            .sort((a, b) => {
              switch (sortBy) {
                case "symbol":
                  return a.symbol.localeCompare(b.symbol);
                case "quantity":
                  return b.shares - a.shares;
                case "avgPrice":
                  return b.average_price - a.average_price;
                case "currentPrice":
                  return b.current_price - a.current_price;
                case "marketValue":
                  return (b.shares * b.current_price) - (a.shares * a.current_price);
                case "portfolio":
                  const aMarketValue = a.shares * a.current_price;
                  const bMarketValue = b.shares * b.current_price;
                  const aPercent = userData.totalValue > 0 ? (aMarketValue / userData.totalValue) * 100 : 0;
                  const bPercent = userData.totalValue > 0 ? (bMarketValue / userData.totalValue) * 100 : 0;
                  return bPercent - aPercent;
                default:
                  return 0;
              }
            })
            .map((pos) => (
              <PortfolioTile
                key={pos.symbol}
                position={pos}
                totalPortfolioValue={userData.totalValue}
                onTrade={handleTrade}
                onAddToWatchlist={addToWatchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
                isInWatchlist={watchlist.includes(pos.symbol)}
                showWatchlistButton={true}
              />
            ))}
        </div>
      </div>

      {/* Activity History */}
      <div>
        <Title2>Activity</Title2>
        <div className="overflow-hidden">
          <TransactionsTable transactions={userData.transactions} />
        </div>
      </div>
    </PageLayout>
  );
}