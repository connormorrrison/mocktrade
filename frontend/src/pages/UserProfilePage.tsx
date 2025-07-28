import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { ActivityTable } from "@/components/activity-table";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Text4 } from "@/components/text-4";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PositionTile } from "@/components/position-tile";
import { UserProfileHeader } from "@/components/user-profile-header";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { Button2 } from "@/components/button-2";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomSkeleton } from "@/components/custom-skeleton";

interface UserData {
  first_name?: string;
  last_name?: string;
  portfolio_value: number;
  positions_value: number;
  cash_balance: number;
  starting_value: number;
  total_return: number;
  return_percentage: number;
  activity_count?: number;
  activities?: Array<{
    id: number;
    symbol: string;
    action: string;
    quantity: number;
    price: number;
    total_amount: number;
    created_at: string;
  }>;
  positions: Array<{
    symbol: string;
    company_name?: string;
    shares: number;
    average_price: number;
    current_price: number;
    current_value: number;
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
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Mock watchlist state (in a real app, this would come from context/API)
  const [watchlist, setWatchlist] = useState<string[]>([
    "AAPL", "GOOGL", "TSLA" // Mock some symbols already in watchlist
  ]);

  const fetchUserData = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/user/${username}`, {
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

  const fetchUserActivities = async () => {
    // Check if activities are included in userData first
    if (userData?.activities) {
      setActivities(userData.activities);
      setActivitiesLoading(false);
      return;
    }
    
    if (!username) return;
    
    try {
      setActivitiesLoading(true);
      
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Check if the user endpoint includes activities
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/user/${username}?include_activities=true`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.activities) {
          const validActivities = data.activities.map((tx: any) => ({
            id: tx.id,
            symbol: tx.symbol,
            action: tx.action?.toUpperCase(),
            quantity: tx.quantity,
            price: tx.price,
            total_amount: tx.total_amount,
            created_at: tx.created_at,
          }));
          setActivities(validActivities);
        } else {
          setActivities([]);
        }
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error fetching user activities:', err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (userData) {
      fetchUserActivities();
    }
  }, [userData]);


  // Loading check first - show skeleton if either main data or activities are loading
  if (loading || activitiesLoading) {
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
          firstName={userData.first_name}
          lastName={userData.last_name}
          username={username!}
        />

        {/* Overview Section */}
        <div className="space-y-2">
          <Title2>Overview</Title2>
          <UserProfileTiles
            totalValue={userData.portfolio_value}
            positionsValue={userData.positions_value}
            cashBalance={userData.cash_balance}
            activityCount={userData.activity_count || userData.positions.length} // Use actual count if available
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
                  const aPercent = userData.portfolio_value > 0 ? (aMarketValue / userData.portfolio_value) * 100 : 0;
                  const bPercent = userData.portfolio_value > 0 ? (bMarketValue / userData.portfolio_value) * 100 : 0;
                  return bPercent - aPercent;
                default:
                  return 0;
              }
            })
            .map((pos) => {
              // Transform API position data to match PositionTile interface
              const transformedPos = {
                symbol: pos.symbol,
                company_name: pos.company_name || pos.symbol,
                shares: pos.shares,
                current_price: pos.current_price,
                average_price: pos.average_price,
                previous_price: pos.current_price, // Mock previous price
              };
              
              return (
                <PositionTile
                  key={pos.symbol}
                  position={transformedPos}
                  totalPortfolioValue={userData.portfolio_value}
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
          <ActivityTable activities={activities} />
        </div>
      </div>
    </PageLayout>
  );
}