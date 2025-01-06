// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

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
        fetch(`http://localhost:8000/api/v1/stocks/quote/^DJI`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/api/v1/stocks/quote/^GSPC`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/api/v1/stocks/quote/^IXIC`, {
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
    
    // Optional: Set up polling for market data
    const intervalId = setInterval(fetchIndexData, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="col-span-1 sm:col-span-2 lg:col-span-3 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-4xl text-center font-normal text-blue-700 -mb-2 mt-2">
              Welcome back, {userData.first_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-center text-lg font-normal mb-2">
              Today is {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">DJIA (^DJI)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(marketData.dow)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">S&P 500 (^GSPC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(marketData.spx)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nasdaq Composite (^IXIC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
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