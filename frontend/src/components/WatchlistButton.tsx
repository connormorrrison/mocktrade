import { useState, useEffect, useRef } from "react";
import { Button2 } from "@/components/Button2";
import { Plus, Minus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  symbol: string;
  isInWatchlist: boolean;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  removing?: boolean;
}

export function WatchlistButton({
  symbol,
  isInWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  removing = false,
}: WatchlistButtonProps) {
  const [adding, setAdding] = useState(false);
  const [justChanged, setJustChanged] = useState(false);
  const prevInWatchlist = useRef(isInWatchlist);

  // detect when isInWatchlist changes (API responded) and show brief success state
  useEffect(() => {
    if (prevInWatchlist.current !== isInWatchlist) {
      setAdding(false);
      setJustChanged(true);
      const timer = setTimeout(() => setJustChanged(false), 1200);
      prevInWatchlist.current = isInWatchlist;
      return () => clearTimeout(timer);
    }
  }, [isInWatchlist]);

  const handleClick = () => {
    if (adding || removing) return;
    if (isInWatchlist) {
      onRemoveFromWatchlist(symbol);
    } else {
      setAdding(true);
      onAddToWatchlist(symbol);
    }
  };

  const pending = adding || removing;

  const icon = pending
    ? <Loader2 className="animate-spin" />
    : justChanged
      ? <Check className="text-green-600" />
      : isInWatchlist
        ? <Minus />
        : <Plus />;

  const label = removing
    ? "Removing..."
    : adding
      ? "Adding..."
      : justChanged && isInWatchlist
        ? "Added!"
        : "Watchlist";

  return (
    <Button2
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "transition-all duration-200",
        justChanged && "scale-105",
        pending && "opacity-70"
      )}
    >
      {icon}
      {label}
    </Button2>
  );
}
