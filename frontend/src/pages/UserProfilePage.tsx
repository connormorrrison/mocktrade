import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PortfolioChart } from "@/components/PortfolioChart";
import { ActivityTable } from "@/components/ActivityTable";
import { Tile } from "@/components/Tile";
import { Title2 } from "@/components/Title2";
import { Text4 } from "@/components/Text4";
import { CustomDropdown } from "@/components/CustomDropdown";
import { PositionTile } from "@/components/PositionTile";
import { UserProfileHeader } from "@/components/UserProfileHeader";
import { UserProfileTiles } from "@/components/UserProfileTiles";
import { Button2 } from "@/components/Button2";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { useUser } from "@/contexts/UserContext";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

interface UserData {
  first_name?: string;
  last_name?: string;
  created_at?: string;
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
  const { userData: currentUser } = useUser();
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [totalActivityCount, setTotalActivityCount] = useState(0);
  const [activitiesOffset, setActivitiesOffset] = useState(0);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);

  const ACTIVITIES_LIMIT = 10;

  // Watchlist hook for real API integration
  const {
    watchlist: watchlistData,
    addToWatchlist,
    removeFromWatchlist
  } = useWatchlist();

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

      // Single fetch that includes activities
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/portfolio/user/${username}?include_activities=true&activities_limit=${ACTIVITIES_LIMIT}&activities_offset=0`,
        { headers }
      );

      if (response.status === 404) {
        setError("User not found");
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);

      // Set activities from the same response
      if (data.activity_count !== undefined) {
        setTotalActivityCount(data.activity_count);
      }

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
        setActivitiesOffset(ACTIVITIES_LIMIT);
        setHasMoreActivities(validActivities.length === ACTIVITIES_LIMIT);
      } else {
        setActivities([]);
        setHasMoreActivities(false);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreActivities = async () => {
    if (!username || isLoadingMoreActivities || !hasMoreActivities) return;

    try {
      setIsLoadingMoreActivities(true);

      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/portfolio/user/${username}?include_activities=true&activities_limit=${ACTIVITIES_LIMIT}&activities_offset=${activitiesOffset}`,
        { headers }
      );

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

          setActivities(prev => [...prev, ...validActivities]);
          setActivitiesOffset(prev => prev + ACTIVITIES_LIMIT);
          setHasMoreActivities(validActivities.length === ACTIVITIES_LIMIT);
        } else {
          setHasMoreActivities(false);
        }
      } else {
        setHasMoreActivities(false);
      }
    } catch (err) {
      console.error('Error fetching more activities:', err);
      setHasMoreActivities(false);
    } finally {
      setIsLoadingMoreActivities(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);


  // Loading check first - show skeleton if either main data or activities are loading
  if (loading) {
    return (
      <PageLayout title="">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  if ((error || !userData) && currentUser) {
    return (
      <PageLayout title="User Not Found">
        <div className="text-center py-12">
          <Title2>User Not Found</Title2>
          <Text4 className="mt-4">The user "{username}" does not exist.</Text4>
        </div>
      </PageLayout>
    );
  }



  const handleTrade = (symbol: string) => {
    navigate("/trade/" + symbol);
  };

  // Check if a symbol is in the watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlistData.some(stock => stock.symbol === symbol);
  };


  return (
    <PageLayout title="">
      <div className="flex flex-col gap-8">
        {/* Back Button */}
        <PopInOutEffect isVisible={!loading} delay={50}>
          <Link to="/leaderboard">
            <Button2>
              <ChevronLeft />
              Back
            </Button2>
          </Link>
        </PopInOutEffect>
        
        {/* Profile Header */}
        <PopInOutEffect isVisible={!loading} delay={100}>
          <UserProfileHeader
            username={username!}
            joinedDate={userData?.created_at}
            variant="public"
          />
        </PopInOutEffect>

        {/* Overview Section */}
        <PopInOutEffect isVisible={!loading} delay={150}>
          <div className="space-y-2">
            <Title2>Overview</Title2>
            <UserProfileTiles
              totalValue={userData?.portfolio_value || 0}
              positionsValue={userData?.positions_value || 0}
              cashBalance={userData?.cash_balance || 0}
              activityCount={totalActivityCount || userData?.activity_count || activities.length}
            />
          </div>
        </PopInOutEffect>
      </div>

      {/* Portfolio Chart */}
      <PopInOutEffect isVisible={!loading} delay={200}>
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
      </PopInOutEffect>

      {/* Current Positions */}
      <div>
        <PopInOutEffect isVisible={!loading} delay={250}>
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
        </PopInOutEffect>
        <div className="space-y-4">
            {userData?.positions
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
                    const aPercent = (userData?.portfolio_value || 0) > 0 ? (aMarketValue / (userData?.portfolio_value || 1)) * 100 : 0;
                    const bPercent = (userData?.portfolio_value || 0) > 0 ? (bMarketValue / (userData?.portfolio_value || 1)) * 100 : 0;
                    return bPercent - aPercent;
                  default:
                    return 0;
                }
              })
              .map((pos, index) => {
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
                  <PopInOutEffect key={pos.symbol} isVisible={!loading} delay={300 + (index * 50)}>
                    <PositionTile
                      position={transformedPos}
                      totalPortfolioValue={userData?.portfolio_value || 0}
                      onTrade={handleTrade}
                      onAddToWatchlist={addToWatchlist}
                      onRemoveFromWatchlist={removeFromWatchlist}
                      isInWatchlist={isInWatchlist(pos.symbol)}
                      showWatchlistButton={true}
                    />
                  </PopInOutEffect>
                );
              })}
        </div>
      </div>

      {/* Activity History */}
      <PopInOutEffect isVisible={!loading} delay={350}>
        <div>
          <Title2>Activity</Title2>
          <div className="overflow-hidden">
            <ActivityTable activities={activities} />

            {/* load more button */}
            {hasMoreActivities && (
              <div className="flex justify-center mt-4">
                <Button2
                  onClick={loadMoreActivities}
                  disabled={isLoadingMoreActivities}
                >
                  {isLoadingMoreActivities ? "Loading..." : "Load More"}
                </Button2>
              </div>
            )}
          </div>
        </div>
      </PopInOutEffect>
    </PageLayout>
  );
}