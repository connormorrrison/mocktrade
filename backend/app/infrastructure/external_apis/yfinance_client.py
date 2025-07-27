# app/infrastructure/external_apis/yfinance_client.py

# This file serves as a backup/alternative location for the YFinance client
# The actual implementation is in app/domains/stocks/external.py for better domain organization

from app.domains.stocks.external import YFinanceClient

# Re-export for backward compatibility if needed
__all__ = ['YFinanceClient']