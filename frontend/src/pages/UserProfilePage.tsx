import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { ActivityTable } from "@/components/activity-table";
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
import { CustomSkeleton } from "@/components/custom-skeleton";

interface UserData {
  cash_balance: number;
  positions_value: number;
  total_value: number;
  starting_value: number;
  total_return: number;
  return_percentage: number;
  positions: Array<{
    symbol: string;
    shares: number;
    average_price: number;
    current_price: number;
    current_value: number;
    unrealized_gain_loss: number;
    unrealized_gain_loss_percent: number;
  }>;
}

export default function UserProfilePage() {
  // Loading state first
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Other state
  const { username } = useParams<{ username: string }>();
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");
  const [userData, setUserData] = useState<UserData | null>(null);

  // Mock watchlist state (in a real app, this would come from context/API)
  const [watchlist, setWatchlist] = useState<string[]>([
    "AAPL", "GOOGL", "TSLA" // Mock some symbols already in watchlist
  ]);

  const fetchUserData = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`http://localhost:8000/api/v1/portfolio/leaderboard/${username}`, {
        headers
      });

      if (response.status === 404) {
        setError("User not found");
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);


  // Loading check first
  if (loading) {
    return (
      <PageLayout title="">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  if (error || !userData) {
    return (
      <PageLayout title="User Not Found">
        <div className="text-center py-12">
          <Title2>User Not Found</Title2>
          <Text4 className="mt-4">The user "{username}" does not exist.</Text4>
        </div>
      </PageLayout>
    );
  }



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
          joinedDate="2024-01-01T00:00:00Z" // Mock joined date since it's not in API
        />

        {/* Overview Section */}
        <div className="space-y-2">
          <Title2>Overview</Title2>
          <UserProfileTiles
            totalValue={userData.total_value}
            cashBalance={userData.cash_balance}
            transactionCount={userData.positions.length} // Use positions count since we don't have transactions
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
                  const aPercent = userData.total_value > 0 ? (aMarketValue / userData.total_value) * 100 : 0;
                  const bPercent = userData.total_value > 0 ? (bMarketValue / userData.total_value) * 100 : 0;
                  return bPercent - aPercent;
                default:
                  return 0;
              }
            })
            .map((pos) => {
              // Transform API position data to match PortfolioTile interface
              const transformedPos = {
                symbol: pos.symbol,
                company_name: pos.symbol, // Use symbol as company name since API doesn't provide it
                shares: pos.shares,
                current_price: pos.current_price,
                average_price: pos.average_price,
                previous_price: pos.current_price, // Mock previous price
                created_at: "2024-01-01T00:00:00Z", // Mock created date
                price_at_selected_range: pos.current_price // Mock selected range price
              };
              
              return (
                <PortfolioTile
                  key={pos.symbol}
                  position={transformedPos}
                  totalPortfolioValue={userData.total_value}
                  onTrade={handleTrade}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  isInWatchlist={watchlist.includes(pos.symbol)}
                  showWatchlistButton={true}
                />
              );
            })}
        </div>
      </div>

      {/* Activity History */}
      <div>
        <Title2>Activity</Title2>
        <div className="overflow-hidden">
          <ActivityTable transactions={[]} />
        </div>
      </div>
    </PageLayout>
  );
}