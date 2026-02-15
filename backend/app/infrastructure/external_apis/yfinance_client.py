# app/infrastructure/external_apis/yfinance_client.py

# this file serves as a backup/alternative location for the YFinance client
# the actual implementation is in app/domains/stocks/external.py for better domain organization

from app.domains.stocks.external import YFinanceClient

# re-export for backward compatibility if needed
__all__ = ['YFinanceClient']