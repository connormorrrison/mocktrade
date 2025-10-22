// react and router
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

// layout and ui components
import { Button1 } from "@/components/button-1";
import { PageLayout } from "@/components/page-layout";
import { ErrorTile } from "@/components/error-tile";
import { TradeConfirm } from "@/components/trade-confirm-dialog";
import { StockPriceDisplay } from "@/components/stock-price-display";
import { CustomSkeleton } from "@/components/custom-skeleton";
import { PopInOutEffect } from "@/components/pop-in-out-effect";

// trade-specific components
import { StockSearchForm } from "@/components/trade/StockSearchForm";
import { TradeActionSelector } from "@/components/trade/TradeActionSelector";
import { TradeQuantityInput } from "@/components/trade/TradeQuantityInput";
import { OrderPreview } from "@/components/trade/OrderPreview";

// hooks
import { useMarketStatus } from "@/components/market-status";
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
  const [pageLoading, setPageLoading] = useState(true);
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
    } finally {
      setPageLoading(false);
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
        throw new Error('Invalid symbol');
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


  // initial page load effect
  useEffect(() => {
    fetchPortfolioSummary();
    if (urlSymbol) {
      fetchStockData(urlSymbol.toUpperCase());
    }
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

  const confirmOrder = async () => {
    try {
      let actionPayload: string;
      if (action) {
        actionPayload = action.toLowerCase();
      } else {
        actionPayload = '';
      }

      await apiExecute('/trading/orders', {
        method: 'POST',
        body: JSON.stringify({
          symbol: searchQuery,
          quantity: numericQuantity,
          action: actionPayload,
        }),
      });

      // success: reset all state
      setIsConfirmDialogOpen(false);
      setSymbolInput('');
      setSearchQuery('');
      setPrice(null);
      setCompanyName('');
      setSharesOwned(0);
      resetForm();
      await fetchPortfolioSummary(); // refresh cash
      
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

      <ErrorTile 
        description={pageError} 
        className="mt-4" 
      />

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