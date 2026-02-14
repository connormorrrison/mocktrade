import React from 'react';
import { Search } from "lucide-react";
import { Button2 } from "@/components/Button2";
import { TextField } from "@/components/TextField";
import { Title2 } from "@/components/Title2";

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

  // --- derived state for the search button ---
  let buttonText: string;
  let isButtonDisabled: boolean;

  // set button text based on loading state
  if (isLoading) {
    buttonText = 'Searching...';
  } else {
    buttonText = 'Search';
  }

  // set disabled state based on loading or empty input
  if (isLoading) {
    isButtonDisabled = true;
  } else if (!symbol) {
    isButtonDisabled = true;
  } else {
    isButtonDisabled = false;
  }
  // ---

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
        <Button2 onClick={onSearch} disabled={isButtonDisabled}>
          <Search />
          {buttonText}
        </Button2>
      </div>
    </div>
  );
};