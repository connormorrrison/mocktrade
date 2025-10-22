// defines the structure of a single trading activity
export interface Activity {
  id: number;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string; // ISO string format expected
}

// defines the possible filter types for activities
export type ActivityFilterType = "All" | "Buy" | "Sell";
