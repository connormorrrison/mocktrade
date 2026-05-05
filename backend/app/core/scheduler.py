# app/core/scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from datetime import date, timedelta
import logging

from app.infrastructure.database import SessionLocal
from app.domains.portfolio.services import PortfolioService
from app.domains.portfolio.models import PortfolioSnapshot
from app.domains.portfolio.repositories import PortfolioRepository
from app.domains.portfolio.schemas import PortfolioSnapshotCreate
from app.domains.auth.repositories import UserRepository
from app.domains.trading.repositories import PositionRepository
from app.domains.stocks.external import YFinanceClient

logger = logging.getLogger(__name__)

# global scheduler instance
scheduler = AsyncIOScheduler()

INITIAL_HISTORY_LOOKBACK_DAYS = 7
MAX_HISTORY_LOOKBACK_DAYS = 30


async def create_daily_snapshots():
    """
    Create portfolio snapshots for all active users.
    This runs daily to populate historical portfolio data for charts.
    """
    logger.info("Starting daily portfolio snapshot creation...")

    db: Session = SessionLocal()
    try:
        # get all active users
        user_repo = UserRepository(db)
        all_users = user_repo.get_all_active()

        logger.info(f"Creating snapshots for {len(all_users)} users")

        # create snapshot for each user
        success_count = 0
        error_count = 0

        for user in all_users:
            try:
                portfolio_service = PortfolioService(db)
                await portfolio_service.create_portfolio_snapshot(user.id)
                success_count += 1
                logger.debug(f"Created snapshot for user {user.username}")
            except Exception as e:
                error_count += 1
                logger.error(f"Error creating snapshot for user {user.username}: {e}")

        logger.info(f"Daily snapshot creation complete. Success: {success_count}, Errors: {error_count}")

    except Exception as e:
        logger.error(f"Error in daily snapshot job: {e}")
    finally:
        db.close()


async def backfill_missing_snapshots():
    """
    Reconstruct missing portfolio snapshots using historical closing prices.

    When the DB is paused (e.g. Supabase free tier), no snapshots are created.
    Instead of carrying forward a stale value (which causes a misleading spike
    on recovery), we fetch actual historical prices from yfinance and
    reconstruct each day's portfolio value so the leaderboard stays accurate.

    Today's snapshot is left to the scheduler startup job (uses live prices).
    """
    logger.info("Starting snapshot backfill check...")

    db: Session = SessionLocal()
    try:
        yesterday = date.today() - timedelta(days=1)

        user_repo = UserRepository(db)
        portfolio_repo = PortfolioRepository(db)
        position_repo = PositionRepository(db)
        all_users = user_repo.get_all_active()

        # Determine per-user gaps. Each user may have a different last snapshot.
        users_to_backfill = []
        earliest_gap_start = None
        for user in all_users:
            last_snapshot = portfolio_repo.get_latest_snapshot(user.id)
            if last_snapshot is None:
                continue
            if last_snapshot.snapshot_date >= yesterday:
                continue
            user_gap_start = last_snapshot.snapshot_date + timedelta(days=1)
            users_to_backfill.append((user, last_snapshot, user_gap_start))
            if earliest_gap_start is None or user_gap_start < earliest_gap_start:
                earliest_gap_start = user_gap_start

        if not users_to_backfill:
            logger.info("No snapshot gaps detected - nothing to backfill")
            return

        logger.info(
            f"Backfilling {len(users_to_backfill)} user(s) from "
            f"{earliest_gap_start} through {yesterday}..."
        )

        # Collect all unique symbols held across users that need backfill.
        # Track the earliest gap date per symbol so we only widen history when
        # a symbol still lacks a usable pre-gap close for one of its holders.
        all_symbols: set[str] = set()
        symbol_earliest_gap_start: dict[str, date] = {}
        user_positions: dict[int, list] = {}
        for user, _, user_gap_start in users_to_backfill:
            positions = position_repo.get_all_by_user(user.id)
            if positions:
                user_positions[user.id] = positions
                for pos in positions:
                    all_symbols.add(pos.symbol)
                    current_earliest = symbol_earliest_gap_start.get(pos.symbol)
                    if current_earliest is None or user_gap_start < current_earliest:
                        symbol_earliest_gap_start[pos.symbol] = user_gap_start

        # Batch-fetch historical closing prices (single yfinance call).
        # Start with a short lookback, then widen it if the fetched history
        # still lacks a usable pre-gap close for any symbol we need.
        historical_prices: dict = {}
        if all_symbols:
            symbols_to_fetch = sorted(all_symbols)
            yf_client = YFinanceClient()
            lookback_days = INITIAL_HISTORY_LOOKBACK_DAYS

            while True:
                fetch_start = earliest_gap_start - timedelta(days=lookback_days)
                try:
                    historical_prices = await yf_client.get_historical_closes(
                        symbols_to_fetch, fetch_start, yesterday
                    )
                except Exception:
                    logger.error(
                        "Failed to fetch historical prices from yfinance - "
                        "aborting backfill to avoid writing inaccurate data"
                    )
                    return

                if not historical_prices:
                    if lookback_days >= MAX_HISTORY_LOOKBACK_DAYS:
                        logger.error(
                            "Historical price batch came back empty after a %s-day "
                            "lookback - aborting backfill to avoid writing inaccurate data",
                            lookback_days,
                        )
                        return

                    next_lookback = min(MAX_HISTORY_LOOKBACK_DAYS, lookback_days * 2)
                    logger.warning(
                        "Historical price batch was empty for %s-day lookback. "
                        "Retrying with %s days.",
                        lookback_days,
                        next_lookback,
                    )
                    lookback_days = next_lookback
                    continue

                missing_pre_gap_symbols = []
                for symbol in symbols_to_fetch:
                    required_by = symbol_earliest_gap_start[symbol]
                    prices_by_date = historical_prices.get(symbol, {})
                    if any(trading_date <= required_by for trading_date in prices_by_date):
                        continue
                    missing_pre_gap_symbols.append(symbol)

                if not missing_pre_gap_symbols:
                    logger.info(
                        "Fetched historical prices for %s symbols using a %s-day lookback",
                        len(historical_prices),
                        lookback_days,
                    )
                    break

                if lookback_days >= MAX_HISTORY_LOOKBACK_DAYS:
                    logger.warning(
                        "No pre-gap close found after a %s-day lookback for symbols %s. "
                        "Proceeding with per-symbol fallback where needed.",
                        lookback_days,
                        ", ".join(sorted(missing_pre_gap_symbols)),
                    )
                    break

                next_lookback = min(MAX_HISTORY_LOOKBACK_DAYS, lookback_days * 2)
                logger.warning(
                    "Expanding historical price lookback from %s to %s days for symbols %s",
                    lookback_days,
                    next_lookback,
                    ", ".join(sorted(missing_pre_gap_symbols)),
                )
                lookback_days = next_lookback

        # Pre-compute sorted trading dates per symbol for efficient lookups
        # on weekends/holidays (find most recent trading day's close)
        sorted_dates: dict[str, list[date]] = {}
        for sym, prices_by_date in historical_prices.items():
            sorted_dates[sym] = sorted(prices_by_date.keys())

        def _get_price(symbol: str, target_date: date, fallback: float) -> float:
            """Get closing price for a date, falling back to most recent trading day."""
            sym_prices = historical_prices.get(symbol)
            if not sym_prices:
                return fallback
            price = sym_prices.get(target_date)
            if price is not None:
                return price
            # Weekend/holiday: walk backwards through sorted trading dates
            for d in reversed(sorted_dates.get(symbol, [])):
                if d <= target_date:
                    return sym_prices[d]
            return fallback

        total_created = 0

        for user, last_snapshot, user_gap_start in users_to_backfill:
            # Cash is frozen during outage — trades require DB writes,
            # so no buys/sells can occur while the DB is paused.
            cash_balance = last_snapshot.cash_balance
            positions = user_positions.get(user.id, [])

            current_date = user_gap_start
            while current_date <= yesterday:
                if portfolio_repo.get_snapshot_by_date(user.id, current_date) is None:
                    # Reconstruct positions value from historical prices
                    positions_value = 0.0
                    for pos in positions:
                        price = _get_price(pos.symbol, current_date, pos.average_price)
                        positions_value += pos.quantity * price

                    portfolio_value = positions_value + cash_balance

                    portfolio_repo.create_snapshot(PortfolioSnapshotCreate(
                        user_id=user.id,
                        snapshot_date=current_date,
                        portfolio_value=portfolio_value,
                        positions_value=positions_value,
                        cash_balance=cash_balance,
                    ))
                    total_created += 1
                current_date += timedelta(days=1)

        logger.info(f"Backfill complete. Created {total_created} reconstructed snapshots.")

    except Exception as e:
        logger.error(f"Error during snapshot backfill: {e}")
        raise
    finally:
        db.close()


def start_scheduler():
    """
    Initialize and start the background scheduler.
    Schedules daily portfolio snapshot creation at market close (4:00 PM ET).
    """
    try:
        # schedule daily snapshots at 4:00 PM ET (market close)
        # using hour=16 for 4 PM in server timezone
        # adjust timezone as needed for your deployment
        scheduler.add_job(
            create_daily_snapshots,
            trigger=CronTrigger(hour=16, minute=0),  # 4:00 PM daily
            id='daily_portfolio_snapshots',
            name='Create daily portfolio snapshots',
            replace_existing=True
        )

        # optional: add a job that runs at startup to create today's snapshot if missing
        scheduler.add_job(
            create_daily_snapshots,
            id='startup_portfolio_snapshots',
            name='Create snapshots on startup'
        )

        scheduler.start()
        logger.info("Scheduler started successfully")
        logger.info("Daily snapshots scheduled for 4:00 PM daily")

    except Exception as e:
        logger.error(f"Error starting scheduler: {e}")
        raise


def shutdown_scheduler():
    """
    Gracefully shutdown the scheduler.
    """
    try:
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Scheduler shut down successfully")
    except Exception as e:
        logger.error(f"Error shutting down scheduler: {e}")
