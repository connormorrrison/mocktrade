import React from 'react';
import { Button1 } from "@/components/Button1";
import { Title2 } from "@/components/Title2";

type Action = "buy" | "sell" | null;
type ButtonVariant = "primary" | "secondary";

// component prop types
interface TradeActionSelectorProps {
  action: Action; // the currently selected action ('buy', 'sell', or null)
  onActionChange: (action: "buy" | "sell") => void; // callback to set the action
  sharesOwned: number; // number of shares the user owns (to disable sell)
}

/**
 * a component with two buttons ('buy' and 'sell') that allows
 * the user to select their desired trade action.
 */
export const TradeActionSelector: React.FC<TradeActionSelectorProps> = ({
  action,
  onActionChange,
  sharesOwned,
}) => {

  // --- derived button variants ---
  let buyButtonVariant: ButtonVariant;
  let sellButtonVariant: ButtonVariant;

  // determine which button should be 'primary' based on the selected action
  if (action === 'buy') {
    buyButtonVariant = 'primary';
    sellButtonVariant = 'secondary';
  } else if (action === 'sell') {
    buyButtonVariant = 'secondary';
    sellButtonVariant = 'primary';
  } else {
    // default state when no action is selected
    buyButtonVariant = 'secondary';
    sellButtonVariant = 'secondary';
  }
  // ---

  return (
    <div>
      <Title2>Action</Title2>

      {/* action selection buttons */}
      <div className="flex sm:flex-row gap-4">
        
        {/* buy button */}
        <Button1
          onClick={() => onActionChange('buy')}
          className="flex-1"
          variant={buyButtonVariant}
        >
          Buy
        </Button1>

        {/* sell button */}
        <Button1
          onClick={() => onActionChange('sell')}
          className="flex-1"
          variant={sellButtonVariant}
          disabled={sharesOwned <= 0} // disable if user has no shares
        >
          Sell
        </Button1>
      </div>
    </div>
  );
};