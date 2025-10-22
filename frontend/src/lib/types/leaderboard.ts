// defines the structure for a user in the leaderboard api response
export interface LeaderboardUser {
  rank: number;
  first_name?: string;
  last_name?: string;
  username: string;
  total_value: number;
  return_amount: number;
  return_percentage: number;
}

// defines the structure for the data the leaderboard component expects
export interface TransformedUser {
  rank: number;
  first_name?: string;
  last_name?: string;
  username: string;
  return: number;
  profit: number;
}

// defines the shared timeframe types
export type Timeframe = "Day" | "Week" | "Month" | "All";
export type ApiTimeframe = "day" | "week" | "month" | "all";
