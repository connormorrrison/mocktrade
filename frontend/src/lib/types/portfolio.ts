// defines a single position held by the user
export interface Position {
  symbol: string;
  company_name?: string;
  shares: number;
  current_price: number;
  average_price: number;
  current_value: number;
}

// defines the complete portfolio summary
export interface PortfolioData {
  portfolio_value: number;
  positions_value: number;
  cash_balance: number;
  positions_count: number;
  positions: Position[];
  activity_count?: number; // optional, based on original code
}
