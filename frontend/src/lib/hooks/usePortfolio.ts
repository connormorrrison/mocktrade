import { useState, useEffect, useCallback } from "react";
import type { PortfolioData } from "@/lib/types/portfolio";

/**
 * this hook fetches and manages all data for the portfolio page,
 * including the summary and activity count.
 */
export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [activityCount, setActivityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivityCount = useCallback(async (token: string) => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/trading/activities", {
        headers: { 'Authorization': "Bearer " + token },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setActivityCount(data.length);
        }
      }
    } catch (error) {
      console.error('error fetching activity count:', error);
      // silently fail, keep default 0
    }
  }, []);

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // no token, set empty portfolio state
        setPortfolioData({
          portfolio_value: 0,
          positions_value: 0,
          cash_balance: 0,
          positions_count: 0,
          positions: []
        });
        setActivityCount(0);
        return;
      }

      const response = await fetch(import.meta.env.VITE_API_URL + "/portfolio/summary", {
        headers: { 'Authorization': "Bearer " + token },
      });

      if (response.ok) {
        const data: PortfolioData = await response.json();
        setPortfolioData(data);
        
        // set activity count from data or fetch separately
        if (data.activity_count !== undefined) {
          setActivityCount(data.activity_count);
        } else {
          fetchActivityCount(token);
        }
      } else {
        throw new Error('failed to fetch portfolio data');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('an unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchActivityCount]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  return { portfolioData, activityCount, loading, error };
};
