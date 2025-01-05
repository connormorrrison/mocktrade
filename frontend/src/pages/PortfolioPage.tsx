// src/pages/PortfolioPage.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface PortfolioPosition {
  symbol: string;
  shares: number;
  current_price: number;
  total_value: number;
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/trading/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      // Validate positions data
      const validPositions = (data.positions || []).map(position => ({
        ...position,
        shares: typeof position.shares === 'number' ? position.shares : 0,
        current_price: typeof position.current_price === 'number' ? position.current_price : 0,
        total_value: typeof position.total_value === 'number' ? position.total_value : 0
      }));
      
      setPositions(validPositions);
      setCashBalance(typeof data.cash_balance === 'number' ? data.cash_balance : 0);
      setError(null);
    } catch (err) {
      setError('Unable to load portfolio data');
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (value: number | null | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Calculate total value only after loading and with validation
  const totalPortfolioValue = positions.reduce((sum, position) => {
    const positionValue = typeof position.total_value === 'number' && !isNaN(position.total_value) 
      ? position.total_value 
      : 0;
    return sum + positionValue;
  }, 0) + (typeof cashBalance === 'number' ? cashBalance : 0);

  return (
    <div className="p-8 w-full mt-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Account Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Cash Balance</p>
                    <p className="text-2xl font-bold">{formatMoney(cashBalance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Portfolio Value</p>
                    <p className="text-2xl font-bold">{formatMoney(totalPortfolioValue)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4">Positions</h3>
                {positions.length === 0 ? (
                  <p className="text-gray-500">No positions in portfolio</p>
                ) : (
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <div 
                        key={position.symbol} 
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{position.symbol}</p>
                          <p className="text-sm text-gray-500">
                            {position.shares.toLocaleString()} shares
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatMoney(position.total_value)}</p>
                          <p className="text-sm text-gray-500">
                            @ {formatMoney(position.current_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}