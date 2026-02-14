// react and router
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

// layout and ui components
import { Button1 } from "@/components/Button1";
import { PageLayout } from "@/components/PageLayout";
import { CustomError } from "@/components/CustomError";
import { TradeConfirm } from "@/components/TradeConfirmDialog";
import { StockPriceDisplay } from "@/components/StockPriceDisplay";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { PopInOutEffect } from "@/components/PopInOutEffect";

// trade-specific components
import { StockSearchForm } from "@/components/trade/StockSearchForm";
import { TradeActionSelector } from "@/components/trade/TradeActionSelector";
import { TradeQuantityInput } from "@/components/trade/TradeQuantityInput";
import { OrderPreview } from "@/components/trade/OrderPreview";

// hooks
import { useMarketStatus } from "@/components/MarketStatus";
import { useApi } from "@/lib/hooks/useApi";
import { useTradeForm } from "@/lib/hooks/useTradeForm";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

// types
interface PortfolioSummary {
  cash_balance: number;
}

interface StockData {
  current_price: number;
  company_name: string;
}

interface PositionData {
  quantity: number;
}

export default function TradePage() {
  // core hooks
  const { symbol: urlSymbol } = useParams<{ symbol?: string }>();
  const {
    execute: apiExecute,
    isLoading: isApiLoading,
    error: apiError,
    setError: setApiError
  } = useApi();
  const isMarketOpen = useMarketStatus();
  const {
    watchlist: watchlistData,
    addToWatchlist,
    removeFromWatchlist
  } = useWatchlist();

  // determine initial state from url
  let initialSymbol: string;
  if (urlSymbol) {
    initialSymbol = urlSymbol.toUpperCase();
  } else {
    initialSymbol = '';
  }

  // page state
  const [symbolInput, setSymbolInput] = useState(initialSymbol);
  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [pageLoading, setPageLoading] = useState(true); // Default to true
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // data state (fetched from api)
  const [availableCash, setAvailableCash] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [sharesOwned, setSharesOwned] = useState(0);

  // form logic hook
  const {
    action,
    quantity,
    dollarAmount,
    inputMode,
    handleActionChange,
    handleInputModeChange,
    handleQuantityChange,
    handleDollarAmountChange,
    resetForm,
    numericQuantity,
    totalValue,
    validationError,
    isSubmittable,
  } = useTradeForm(price, sharesOwned, availableCash);


  // data fetching functions
  const fetchPortfolioSummary = useCallback(async () => {
    try {
      const data = await apiExecute<PortfolioSummary>('/portfolio/summary');
      if (data) {
        setAvailableCash(data.cash_balance);
      }
    } catch (err) {
      console.error('failed to load portfolio summary:', err);
      // PERF FIX #2: Removed the `finally` block that set pageLoading(false).
      // This will now be handled by the main useEffect.
    }
  }, [apiExecute]);

  const fetchStockData = useCallback(async (symbolToFetch: string) => {
    if (!symbolToFetch) {
      return;
    }

    // reset state for a new search
    setApiError(null);
    setPrice(null); 
    setCompanyName('');
    setSharesOwned(0);
    resetForm();

    try {
      // fetch price and position in parallel
      const [priceData, positionData] = await Promise.all([
        apiExecute<StockData>("/stocks/" + symbolToFetch),
        apiExecute<PositionData>("/trading/positions/" + symbolToFetch).catch(() => ({ quantity: 0 })),
      ]);

      if (priceData.current_price === 0) {
        throw new Error(`No results found for "${symbolToFetch}". Please check the symbol and try again.`);
      }

      // set new state
      setPrice(priceData.current_price);
      
      let newCompanyName: string;
      if (priceData.company_name) {
        newCompanyName = priceData.company_name;
      } else {
        newCompanyName = symbolToFetch;
      }
      setCompanyName(newCompanyName);
      
      let newSharesOwned: number;
      if (positionData) {
        newSharesOwned = positionData.quantity;
      } else {
        newSharesOwned = 0;
      }
      setSharesOwned(newSharesOwned);
      
      setSearchQuery(symbolToFetch);
      
    } catch (err: any) {
      setApiError(err.message);
      setSearchQuery('');
    }
  }, [apiExecute, setApiError, resetForm]);


  // PERF FIX #2: INITIAL PAGE LOAD (DATA WATERFALL)
  // This effect now controls the pageLoading state for ALL
  // initial data fetches, ensuring the skeleton doesn't
  // disappear until everything is ready.
  useEffect(() => {
    const loadInitialData = async () => {
      setPageLoading(true); // Explicitly set loading to true
      try {
        // Create a list of all promises we need to resolve
        const initialDataPromises: Promise<any>[] = [fetchPortfolioSummary()];

        if (urlSymbol) {
          initialDataPromises.push(fetchStockData(urlSymbol.toUpperCase()));
        }

        // Wait for ALL of them to finish
        await Promise.all(initialDataPromises);

      } catch (err) {
        console.error("Failed to load initial page data:", err);
        // You could set a page-level error here
      } finally {
        // Only stop loading once everything is done
        setPageLoading(false);
      }
    };

    loadInitialData();
    // We only want this to run once on load, based on the URL symbol
    // and the memoized fetch functions.
  }, [urlSymbol, fetchPortfolioSummary, fetchStockData]);


  // event handlers
  const handleSymbolInputChange = (newValue: string) => {
    setSymbolInput(newValue); // always update the text field
    
    // if the user clears the input, reset all search/data state
    if (newValue === '') {
      setSearchQuery('');
      setPrice(null);
      setCompanyName('');
      setSharesOwned(0);
      setApiError(null); // clear any "invalid symbol" errors
      resetForm(); // reset the trade form (buy/sell, quantity)
    }
  };

  const handleSearch = () => {
    fetchStockData(symbolInput);
  };

  const handleSubmitOrder = () => {
    if (!isSubmittable) {
      let errorMsg: string;
      if (validationError) {
        errorMsg = validationError;
      } else {
        errorMsg = "order cannot be submitted";
      }
      setApiError(errorMsg);
      return;
    }
    
    setApiError(null);
    setIsConfirmDialogOpen(true);
  };

  // PERF FIX #3: SLOW ORDER SUBMISSION
  // This function now provides an "optimistic" response.
  // It only awaits the critical API call, then immediately
  // resets the UI and refreshes cash in the background.
  const confirmOrder = async () => {
    try {
      let actionPayload: string;
      if (action) {
        actionPayload = action.toLowerCase();
      } else {
        actionPayload = '';
      }

      // 1. Await ONLY the critical order submission
      await apiExecute('/trading/orders', {
        method: 'POST',
        body: JSON.stringify({
          symbol: searchQuery,
          quantity: numericQuantity,
          action: actionPayload,
        }),
      });

      // 2. Give INSTANT UI feedback: close dialog & reset form
      setIsConfirmDialogOpen(false);
      setSymbolInput('');
      setSearchQuery('');
      setPrice(null);
      setCompanyName('');
      setSharesOwned(0);
      resetForm();
      
      // 3. Refresh cash balance in the background (no await)
      // The user doesn't need to wait for this.
      fetchPortfolioSummary();
      
    } catch (err) {
      // error is automatically set by the useApi hook
      setIsConfirmDialogOpen(false);
    }
  };


  // derived state for rendering
  let pageError: string | null;
  if (apiError) {
    pageError = apiError;
  } else {
    pageError = validationError;
  }

  let showStockInfo: boolean;
  if (searchQuery && price && !apiError) {
    showStockInfo = true;
  } else {
    showStockInfo = false;
  }

  const showActions = showStockInfo;

  let showQuantity: boolean;
  if (showActions && action) {
    showQuantity = true;
  } else {
    showQuantity = false;
  }

  const showPreview = showQuantity;

  let submitButtonText: string;
  if (isApiLoading) {
    submitButtonText = 'Submitting...';
  } else {
    submitButtonText = 'Submit Order';
  }

  let isSubmitButtonDisabled: boolean;
  if (isApiLoading) {
    isSubmitButtonDisabled = true;
  } else if (!isSubmittable) {
    isSubmitButtonDisabled = true;
  } else {
    isSubmitButtonDisabled = false;
  }

  let confirmDialogAction: string;
  if (action) {
    confirmDialogAction = action;
  } else {
    confirmDialogAction = '';
  }
  
  let confirmDialogPrice: number;
  if (price !== null) {
    confirmDialogPrice = price;
  } else {
    confirmDialogPrice = 0;
  }


  // render logic
  if (pageLoading) {
    return (
      <PageLayout title="Trade">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Trade">

      <PopInOutEffect isVisible={!pageLoading} delay={50}>
        <StockSearchForm
          symbol={symbolInput}
          onSymbolChange={handleSymbolInputChange}
          onSearch={handleSearch}
          isLoading={isApiLoading}
        />
      </PopInOutEffect>

      <CustomError error={apiError} onClose={() => setApiError(null)} />

      <PopInOutEffect isVisible={showStockInfo}>
        <StockPriceDisplay
          symbol={searchQuery}
          price={price}
          companyName={companyName}
          sharesOwned={sharesOwned}
          isMarketOpen={isMarketOpen}
          error={pageError}
          onAddToWatchlist={addToWatchlist}
          onRemoveFromWatchlist={removeFromWatchlist}
          isInWatchlist={watchlistData.some(stock => stock.symbol === searchQuery)}
        />
      </PopInOutEffect>

      <PopInOutEffect isVisible={showActions}>
        <TradeActionSelector
          action={action}
          onActionChange={handleActionChange}
          sharesOwned={sharesOwned}
        />
      </PopInOutEffect>

      <PopInOutEffect isVisible={showQuantity}>
        <TradeQuantityInput
          inputMode={inputMode}
          quantity={quantity}
          dollarAmount={dollarAmount}
          onInputModeChange={handleInputModeChange}
          onQuantityChange={handleQuantityChange}
          onDollarAmountChange={handleDollarAmountChange}
        />
      </PopInOutEffect>

      <PopInOutEffect isVisible={showPreview}>
        <OrderPreview
          action={action}
          inputMode={inputMode}
          numericQuantity={numericQuantity}
          dollarAmount={dollarAmount}
          price={price}
          availableCash={availableCash}
          totalValue={totalValue}
        />
      </PopInOutEffect>

      <PopInOutEffect isVisible={showPreview}>
        <Button1
          className="w-full"
          onClick={handleSubmitOrder}
          disabled={isSubmitButtonDisabled}
        >
          {submitButtonText}
        </Button1>
      </PopInOutEffect>

      <TradeConfirm
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmOrder}
        symbol={searchQuery}
        action={confirmDialogAction}
        quantity={numericQuantity}
        price={confirmDialogPrice}
      />

    </PageLayout>
  );
}