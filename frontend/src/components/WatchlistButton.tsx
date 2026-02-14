import { Button2 } from "@/components/Button2";
import { Plus, Minus } from "lucide-react";

interface WatchlistButtonProps {
  symbol: string;
  isInWatchlist: boolean;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
}

export function WatchlistButton({
  symbol,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}: WatchlistButtonProps) {
  if (isInWatchlist) {
    return (
      <Button2 onClick={() => onRemoveFromWatchlist(symbol)}>
        <Minus />
        Watchlist
      </Button2>
    );
  }

  return (
    <Button2 onClick={() => onAddToWatchlist(symbol)}>
      <Plus />
      Watchlist
    </Button2>
  );
}
