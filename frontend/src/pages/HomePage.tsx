// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from '../contexts/UserContext';

export default function HomePage() {
  const { userData, refreshUserData } = useUser();
  const [dow, setDow] = useState<number | null>(null);
  const [spx, setSpx] = useState<number | null>(null);
  const [nasdaq, setNasdaq] = useState<number | null>(null);
  const [isIndexLoading, setIsIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    refreshUserData();
  }, []);

  // Fetch indices on mount
  useEffect(() => {
    fetchIndexData();
  }, []);

  const fetchIndexData = async () => {
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

      if (!dowResp.ok) throw new Error('Failed to fetch DOW');
      if (!spxResp.ok) throw new Error('Failed to fetch S&P 500');
      if (!nasdaqResp.ok) throw new Error('Failed to fetch Nasdaq');

      const [dowData, spxData, nasdaqData] = await Promise.all([
        dowResp.json(),
        spxResp.json(),
        nasdaqResp.json()
      ]);

      if (!dowData.current_price || !spxData.current_price || !nasdaqData.current_price) {
        throw new Error('Missing or invalid price data in one of the responses');
      }

      setDow(dowData.current_price);
      setSpx(spxData.current_price);
      setNasdaq(nasdaqData.current_price);

    } catch (err: any) {
      console.error('Error fetching index data:', err);
      setIndexError(err.message || 'Error fetching indices');
    } finally {
      setIsIndexLoading(false);
    }
  };

  const formatMoney = (value: number | null, currency = 'USD') => {
    if (value === null) return 'Loading...';
    return `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} ${currency}`;
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="col-span-1 sm:col-span-2 lg:col-span-3 hover:shadow-lg transition-shadow">
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">DJIA (^DJI)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(dow)}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">S&P 500 (^GSPC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(spx)}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nasdaq Composite (^IXIC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 text-base font-medium mr-2 animate-pulse">Live</p>
            <p className="text-3xl font-normal">
              {isIndexLoading ? 'Loading...' : formatMoney(nasdaq)}
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