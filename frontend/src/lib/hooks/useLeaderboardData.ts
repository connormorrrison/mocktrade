import { useState, useEffect, useCallback } from "react";
import type { LeaderboardUser, Timeframe, ApiTimeframe } from "@/lib/types/leaderboard";

// utility to map ui state to api parameter
const mapTimeframeToAPI = (timeframe: Timeframe): ApiTimeframe => {
    switch (timeframe) {
      case "Day": return "day";
      case "Week": return "week";
      case "Month": return "month";
      case "All": return "all";
      default: return "all";
    }
};

/**
 * this hook fetches and manages leaderboard data based on a timeframe.
 * it handles loading and error states.
 */
export const useLeaderboardData = (timeframe: Timeframe) => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // usecallback ensures this function is stable
    const fetchLeaderboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('access_token');
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };
      
            if (token) {
              headers['Authorization'] = "Bearer " + token;
            }
      
            const apiTimeframe = mapTimeframeToAPI(timeframe);
            const response = await fetch(import.meta.env.VITE_API_URL + "/portfolio/leaderboard?timeframe=" + apiTimeframe, {
              headers
            });
      
            if (!response.ok) {
              throw new Error('Failed to fetch leaderboard data');
            }
      
            const data = await response.json();
            setLeaderboardData(data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = 'Failed to load leaderboard data';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [timeframe]); // it re-creates only when timeframe changes

    // this effect runs the fetch function whenever it changes
    useEffect(() => {
        fetchLeaderboardData();
    }, [fetchLeaderboardData]);

    return { leaderboardData, loading, error };
};
