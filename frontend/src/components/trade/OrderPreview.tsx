import React from 'react';
import { formatMoney } from "@/lib/formatMoney";
import { Text3 } from "@/components/Text3";
import { Text4 } from "@/components/Text4";
import { Text5 } from "@/components/Text5";
import { Title2 } from "@/components/Title2";

// component prop types
interface OrderPreviewProps {
  action: "buy" | "sell" | null;
  inputMode: "quantity" | "dollars";
  numericQuantity: number;
  dollarAmount: string;
  price: number | null;
  availableCash: number | null;
  totalValue: number;
}

/**
 * a component that displays a summary of the trade details
 * before the user confirms the order.
 */
export const OrderPreview: React.FC<OrderPreviewProps> = ({
  action,
  inputMode,
  numericQuantity,
  dollarAmount,
  price,
  availableCash,
  totalValue,
}) => {

  // generates the human-readable summary text for the order
  // e.g., "buy $100.00 worth..." or "sell 10 shares..."
  const getOrderDescription = () => {
    if (action === null || numericQuantity <= 0) {
      return 'N/A';
    }
    
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    
    if (inputMode === 'dollars' && Number(dollarAmount) > 0) {
      // dollar amount description
      return actionText + " $" + Number(dollarAmount).toFixed(2) + " worth (≈" + numericQuantity.toFixed(3) + " shares) at Market";
    } else {
      // share quantity description
      let shareText: string;
      if (numericQuantity === 1) {
        shareText = 'share';
      } else {
        shareText = 'shares';
      }
      return actionText + " " + numericQuantity + " " + shareText + " at Market";
    }
  };

  // --- derived values for display ---
  let displayPrice: number;
  let displayCash: number;

  if (price !== null) {
    displayPrice = price;
  } else {
    displayPrice = 0;
  }

  if (availableCash !== null) {
    displayCash = availableCash;
  } else {
    displayCash = 0;
  }
  // ---

  return (
    <div>
      <Title2>Order Preview</Title2>
      <div className="space-y-2">

        {/* order summary line */}
        <div className="flex justify-between items-center">
          <Text4>Order</Text4>
          <Text5>{getOrderDescription()}</Text5>
        </div>

        {/* price line */}
        <div className="flex justify-between items-center">
          <Text4>Price per Share</Text4>
          <Text5>{formatMoney(displayPrice)}</Text5>
        </div>

        {/* cash line */}
        <div className="flex justify-between items-center">
          <Text4>Cash Available</Text4>
          <Text5>{formatMoney(displayCash)}</Text5>
        </div>

        {/* total value line */}
        <div className="flex justify-between items-center">
          <Text4>Total Value</Text4>
          <Text3>{formatMoney(totalValue)}</Text3>
        </div>
        
      </div>
    </div>
  );
};