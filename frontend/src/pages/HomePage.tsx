// src/pages/HomePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// Market indices configuration
const MARKET_INDICES = [
  { symbol: '^DJI', key: 'dow', name: 'DJIA' },
  { symbol: '^GSPC', key: 'spx', name: 'S&P 500' },
  { symbol: '^IXIC', key: 'nasdaq', name: 'Nasdaq' }
];

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
};

const isMarketOpen = () => {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const day = easternTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  const currentTime = hour + minute / 60;

  // Market is closed on weekends
  if (day === 0 || day === 6) {
    return false;
  }

  // Market hours: 9:30 AM - 4:00 PM Eastern Time
  const marketOpen = 9.5; // 9:30 AM
  const marketClose = 16; // 4:00 PM

  return currentTime >= marketOpen && currentTime < marketClose;
};

export default function HomePage() {
  const { userData, refreshUserData } = useUser();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState({
    dow: null,
    spx: null,
    nasdaq: null
  });
  const [isIndexLoading, setIsIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    // Update greeting every minute
    const greetingInterval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(greetingInterval);
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  // Elegant fetchIndexData with individual error handling
  const fetchIndexData = useCallback(async () => {
    setIsIndexLoading(true);
    setIndexError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      // Helper function to fetch individual symbol
      const fetchSymbol = async (index: typeof MARKET_INDICES[0]) => {
        try {
          const response = await fetch(`${API_URL}/stocks/quote/${index.symbol}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            console.warn(`Failed to fetch ${index.symbol}: ${response.status}`);
            return { [index.key]: null }; // Graceful degradation
          }
          
          const data = await response.json();
          return { [index.key]: data.current_price };
        } catch (error) {
          console.warn(`Error fetching ${index.symbol}:`, error);
          return { [index.key]: null };
        }
      };

      // Fetch all symbols with individual error handling
      const results = await Promise.allSettled(
        MARKET_INDICES.map(fetchSymbol)
      );
      
      // Merge successful results
      const newMarketData = results.reduce((acc, result, i) => {
        if (result.status === 'fulfilled') {
          return { ...acc, ...result.value };
        } else {
          console.warn(`Failed to fetch ${MARKET_INDICES[i].symbol}:`, result.reason);
          return { ...acc, [MARKET_INDICES[i].key]: null };
        }
      }, {} as typeof marketData);

      setMarketData(newMarketData);
      
      // Only show error if ALL requests failed
      const hasAnyData = Object.values(newMarketData).some(value => value !== null);
      if (!hasAnyData) {
        setIndexError('Failed to fetch any market data');
      }
    } catch (err: any) {
      setIndexError(err.message || 'Error fetching indices');
    } finally {
      setIsIndexLoading(false);
    }
  }, []);

  // Check authentication and fetch data once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!userData) {
      refreshUserData();
    }
    
    fetchIndexData();
  }, [refreshUserData, fetchIndexData, navigate, userData]);

  // Separate useEffect for interval management based on market hours and page visibility
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Only start interval if market is open AND page is visible
    if (isMarketOpen() && isPageVisible) {
      intervalId = setInterval(() => {
        // Double-check both conditions before each fetch
        if (isMarketOpen() && !document.hidden) {
          fetchIndexData();
        }
      }, 300000); // Update every 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPageVisible, fetchIndexData]); // Re-run when visibility changes

  const formatMoney = (value: number | null, currency = 'USD') => {
    if (value === null) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col justify-center items-center h-full">
      {/* Welcome Message Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card 
          className={`
            col-span-1 sm:col-span-2 lg:col-span-3 shadow-lg hover:shadow-xl
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
          `}
        >
          <CardHeader>
            <CardTitle className="text-4xl text-center font-medium text-blue-700 -mb-2 mt-2">
              {greeting}, {userData.first_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg font-normal mb-2">
              Today is {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>
  
      {/* Market Indices Header Block */}
      <div className="w-full max-w-4xl mt-8 flex justify-start">
        <Card 
          className={`
            shadow-lg hover:shadow-xl
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
          `}
        >
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="mr-3">Market Indices</span>
              {isMarketOpen() ? (
                <>
                  <span className={`h-3 w-3 rounded-full bg-green-500 ${isPageVisible ? 'animate-pulse' : ''}`} />
                  <span className={`text-green-600 text-base font-normal ${isPageVisible ? 'animate-pulse' : ''}`}>
                    Market Open - {isPageVisible ? '5 min. delay' : 'Paused'}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-red-600 text-base font-normal">Market Closed</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
  
      {/* Indices Grid Block */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card 
          className={`
            shadow-lg hover:shadow-xl
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
            delay-100
          `}
        >
          <CardHeader>
            <CardTitle className="text-lg font-medium">DJIA (^DJI)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-normal mr-2 animate-pulse">Latest price</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(marketData.dow)}
            </p>
          </CardContent>
        </Card>
  
        <Card 
          className={`
            shadow-lg hover:shadow-xl
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
            delay-150
          `}
        >
          <CardHeader>
            <CardTitle className="text-lg font-medium">S&P 500 (^GSPC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-normal mr-2 animate-pulse">Latest price</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(marketData.spx)}
            </p>
          </CardContent>
        </Card>
  
        <Card 
          className={`
            shadow-lg hover:shadow-xl
            ${baseCardClass}
            ${isVisible ? visibleCardClass : hiddenCardClass}
            delay-200
          `}
        >
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nasdaq Composite (^IXIC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-normal mr-2 animate-pulse">Latest price</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(marketData.nasdaq)}
            </p>
          </CardContent>
        </Card>
      </div>
  
      {indexError && (
        <p className="text-red-600 mt-4">
          {indexError}
        </p>
      )}
    </div>
  );
}