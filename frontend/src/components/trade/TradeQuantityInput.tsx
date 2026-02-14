import React from 'react';
import { Button1 } from "@/components/Button1";
import { TextField } from "@/components/TextField";
import { Title2 } from "@/components/Title2";

type InputMode = "quantity" | "dollars";
type ButtonVariant = "primary" | "secondary";

// component prop types
interface TradeQuantityInputProps {
  inputMode: InputMode;
  quantity: string;
  dollarAmount: string;
  onInputModeChange: (mode: InputMode) => void;
  onQuantityChange: (value: string) => void;
  onDollarAmountChange: (value: string) => void;
}

/**
 * a component that allows a user to input a trade amount,
 * toggling between a number of shares or a dollar value.
 */
export const TradeQuantityInput: React.FC<TradeQuantityInputProps> = ({
  inputMode,
  quantity,
  dollarAmount,
  onInputModeChange,
  onQuantityChange,
  onDollarAmountChange,
}) => {
  
  // routes the text field's change event to the correct handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // basic validation: allow only empty strings or positive numbers
    if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
      if (inputMode === 'quantity') {
        onQuantityChange(val);
      } else {
        onDollarAmountChange(val);
      }
    }
  };

  // --- derived props for buttons and textfield ---
  let value: string;
  let stepValue: string;
  let minValue: string;
  let placeholderText: string;
  let formatType: 'number' | 'currency';
  let quantityButtonVariant: ButtonVariant;
  let dollarsButtonVariant: ButtonVariant;

  // set all dynamic props based on the current input mode
  if (inputMode === 'quantity') {
    // text field props
    value = quantity;
    stepValue = "0.001";
    minValue = "0.001";
    placeholderText = "Enter number of shares";
    formatType = "number";
    
    // button props
    quantityButtonVariant = "primary";
    dollarsButtonVariant = "secondary";
  } else {
    // text field props
    value = dollarAmount;
    stepValue = "0.01";
    minValue = "0.01";
    placeholderText = "Enter dollar amount";
    formatType = "currency";
    
    // button props
    quantityButtonVariant = "secondary";
    dollarsButtonVariant = "primary";
  }
  // ---

  return (
    <div>
      <Title2>Quantity</Title2>

      {/* input mode toggles */}
      <div className="flex sm:flex-row gap-4 mb-4">
        <Button1
          onClick={() => onInputModeChange('quantity')}
          className="flex-1"
          variant={quantityButtonVariant}
        >
          Shares
        </Button1>
        <Button1
          onClick={() => onInputModeChange('dollars')}
          className="flex-1"
          variant={dollarsButtonVariant}
        >
          Dollar Amount
        </Button1>
      </div>

      {/* dynamic input field */}
      <TextField
        type="number"
        formatType={formatType}
        value={value}
        onChange={handleChange}
        step={stepValue}
        min={minValue}
        placeholder={placeholderText}
      />
    </div>
  );
};