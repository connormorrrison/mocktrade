// src/pages/HomePage.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

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

  const baseCardClass = "transform transition-all duration-500 ease-out";
  const hiddenCardClass = "opacity-0 translate-y-4 scale-95";
  const visibleCardClass = "opacity-100 translate-y-0 scale-100";

  // Memoize fetchIndexData
  const fetchIndexData = useCallback(async () => {
    setIsIndexLoading(true);
    setIndexError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }

      const [dowResp, spxResp, nasdaqResp] = await Promise.all([
        fetch(`${API_URL}/stocks/quote/^DJI`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/stocks/quote/^GSPC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/stocks/quote/^IXIC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dowResp.ok || !spxResp.ok || !nasdaqResp.ok) {
        throw new Error('Failed to fetch market data');
      }

      const [dowData, spxData, nasdaqData] = await Promise.all([
        dowResp.json(),
        spxResp.json(),
        nasdaqResp.json()
      ]);

      setMarketData({
        dow: dowData.current_price,
        spx: spxData.current_price,
        nasdaq: nasdaqData.current_price
      });
    } catch (err: any) {
      setIndexError(err.message || 'Error fetching indices');
    } finally {
      setIsIndexLoading(false);
    }
  }, []); // Empty dependency array as it doesn't depend on any props or state

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
    
    // Set up polling for market data every 5 minutes, but only during market hours
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isMarketOpen()) {
      intervalId = setInterval(() => {
        // Check market status before each fetch
        if (isMarketOpen()) {
          fetchIndexData();
        }
      }, 300000); // Update every 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshUserData, fetchIndexData, navigate, userData]);

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
                  <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 text-base font-normal animate-pulse">Market Open - 5 min. delay</span>
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