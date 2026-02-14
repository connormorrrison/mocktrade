import React from 'react';
import { Search, Loader2 } from "lucide-react";
import { Button2 } from "@/components/Button2";
import { TextField } from "@/components/TextField";
import { Title2 } from "@/components/Title2";
import { cn } from "@/lib/utils";

// component prop types
interface StockSearchFormProps {
  symbol: string; // the current value of the search input
  onSymbolChange: (value: string) => void; // callback to update the symbol
  onSearch: () => void; // callback to trigger the search
  isLoading: boolean; // flag for when a search is in progress
}

/**
 * a simple form component with a text input and a search button.
 * it handles user input and triggers a search action.
 */
export const StockSearchForm: React.FC<StockSearchFormProps> = ({
  symbol,
  onSymbolChange,
  onSearch,
  isLoading,
}) => {

  // handles the 'enter' key press to trigger a search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const isButtonDisabled = isLoading || !symbol;

  return (
    <div>
      <Title2>Search</Title2>
      <div className="flex sm:flex-row gap-4">

        {/* symbol input field */}
        <TextField
          className="flex-1"
          placeholder="Enter symbol (e.g., AAPL)"
          value={symbol}
          uppercase={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSymbolChange(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
        />

        {/* search button */}
        <Button2
          onClick={onSearch}
          disabled={isButtonDisabled}
          className={cn(
            "transition-all duration-200",
            isLoading && "opacity-70"
          )}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          {isLoading ? 'Searching...' : 'Search'}
        </Button2>
      </div>
    </div>
  );
};
