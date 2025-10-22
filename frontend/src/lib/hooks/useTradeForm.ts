import { useState, useMemo, useCallback } from "react";

type Action = "buy" | "sell" | null;
type InputMode = "quantity" | "dollars";

/**
 * a hook to manage all the complex state and logic for a trade form.
 * it handles:
 * - user inputs (action, quantity, dollars)
 * - automatic calculation between shares and dollars
 * - validation based on price, cash, and shares owned
 * - resetting the form
 */
export const useTradeForm = (
  price: number | null,
  sharesOwned: number,
  availableCash: number | null
) => {
  // --- form state ---
  const [action, setAction] = useState<Action>(null);
  const [quantity, setQuantity] = useState('');
  const [dollarAmount, setDollarAmount] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('quantity');

  // --- state handlers ---

  // sets the trade action (buy or sell)
  const handleActionChange = (newAction: "buy" | "sell") => {
    setAction(newAction);
  };

  // toggles the input mode between 'quantity' (shares) and 'dollars'
  const handleInputModeChange = (newMode: InputMode) => {
    setInputMode(newMode);
    setQuantity('');
    setDollarAmount('');
  };

  // handles direct input of shares
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    setDollarAmount(''); // clear dollar amount when shares are typed
  };

  // handles direct input of dollars and calculates equivalent shares
  const handleDollarAmountChange = (value: string) => {
    setDollarAmount(value);
    
    // automatically calculate the equivalent shares
    if (price !== null && price > 0) {
      if (Number(value) > 0) {
        setQuantity((Number(value) / price).toString());
      } else {
        setQuantity('');
      }
    } else {
      // if price is null or zero, we can't calculate
      setQuantity('');
    }
  };
  
  // utility to reset all form fields to their default state
  const resetForm = useCallback(() => {
    setAction(null);
    setQuantity('');
    setDollarAmount('');
    setInputMode('quantity');
  }, []);

  // --- derived data and calculations ---

  // safely converts the quantity string to a number
  const numericQuantity = useMemo(() => {
    const num = Number(quantity);
    if (isNaN(num)) {
      return 0;
    }
    return num;
  }, [quantity]);

  // calculates the total value of the order
  const totalValue = useMemo(() => {
    let currentPrice: number;
    if (price !== null) {
      currentPrice = price;
    } else {
      currentPrice = 0;
    }
    return currentPrice * numericQuantity;
  }, [price, numericQuantity]);

  // performs all validation checks and returns an error or submittable status
  const validation = useMemo(() => {
    // 1. must have an action
    if (!action) {
      return { error: null, isSubmittable: false };
    }
    
    // 2. must have a valid quantity
    if (numericQuantity < 0.001) {
      return { error: null, isSubmittable: false };
    }

    // 3. check buy-specific rules
    if (action === 'buy') {
      let currentCash: number;
      if (availableCash !== null) {
        currentCash = availableCash;
      } else {
        currentCash = 0;
      }
      
      if (totalValue > currentCash) {
        return { error: 'Insufficient cash', isSubmittable: false };
      }
    }
    
    // 4. check sell-specific rules
    if (action === 'sell') {
      if (numericQuantity > sharesOwned) {
        return { error: `You can sell up to ${sharesOwned} shares`, isSubmittable: false };
      }
    }

    // 5. all checks passed
    return { error: null, isSubmittable: true };
  }, [numericQuantity, totalValue, availableCash, sharesOwned, action]);

  // --- return public api ---
  return {
    // raw state
    action,
    quantity,
    dollarAmount,
    inputMode,
    
    // state handlers
    handleActionChange,
    handleInputModeChange,
    handleQuantityChange,
    handleDollarAmountChange,
    resetForm,
    
    // derived data
    numericQuantity,
    totalValue,
    validationError: validation.error,
    isSubmittable: validation.isSubmittable,
  };
};