// defines the structure for a market index like s&p 500
export interface MarketIndex {
  symbol: string;
  ticker: string;
  value: number;
  change: number;
  percent: number;
}

// defines the structure for a top gainer or loser
export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}
