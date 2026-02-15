import { useState, useEffect, useCallback } from "react";
import { useMarketStatus } from "@/components/MarketStatus";
// updated import path for types
import type { MarketIndex, MarketMover } from "@/lib/types/market";

// internal types for api responses
interface MarketDataResponse {
  indices: MarketIndex[];
}

interface MarketMoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
}

/**
 * this hook fetches and manages all data for the home page,
 * including market indices and top movers.
 * it automatically refreshes the data every 5 minutes.
 */
export const useMarketData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [marketGainers, setMarketGainers] = useState<MarketMover[]>([]);
  const [marketLosers, setMarketLosers] = useState<MarketMover[]>([]);

  const isMarketOpen = useMarketStatus();

  // defines the data fetching logic in a stable callback
  const fetchMarketData = useCallback(async () => {
    // keep loading as true while fetching, even on interval
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = "Bearer " + token;
      }

      // fetch indices and movers in parallel
      const [indicesResponse, moversResponse] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + "/stocks/market/indices", { headers }),
        fetch(import.meta.env.VITE_API_URL + "/stocks/market/movers", { headers })
      ]);

      if (!indicesResponse.ok) {
        throw new Error('failed to fetch market indices');
      }
      if (!moversResponse.ok) {
        throw new Error('failed to fetch market movers');
      }

      const indicesData: MarketDataResponse = await indicesResponse.json();
      const moversData: MarketMoversResponse = await moversResponse.json();

      // set the state
      if (indicesData.indices) {
        setMarketIndices(indicesData.indices);
      } else {
        setMarketIndices([]);
      }

      if (moversData.gainers) {
        setMarketGainers(moversData.gainers);
      } else {
        setMarketGainers([]);
      }
      
      if (moversData.losers) {
        setMarketLosers(moversData.losers);
      } else {
        setMarketLosers([]);
      }
      
      setError(null);
    } catch (err) {
      let errorMessage: string;
      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = 'Failed to load market data.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // no dependencies, this function is stable

  useEffect(() => {
    fetchMarketData();

    // set up the 5-minute refresh interval
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

    // clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [isMarketOpen, fetchMarketData]);

  return { 
    isLoading, 
    error, 
    marketIndices, 
    marketGainers, 
    marketLosers, 
    retryFetch: fetchMarketData // expose retry
  };
};
