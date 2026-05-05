import pytest
from datetime import date, timedelta
from unittest.mock import patch, AsyncMock

from app.domains.portfolio.models import PortfolioSnapshot
from app.domains.portfolio.schemas import PortfolioSnapshotCreate
from app.domains.portfolio.repositories import PortfolioRepository
from app.domains.trading.repositories import PositionRepository
from app.domains.auth.repositories import UserRepository
from app.domains.auth.schemas import UserCreate
from app.domains.stocks.external import YFinanceClient
from app.core.config import today_et
from app.core.security import get_password_hash
from app.core.scheduler import backfill_missing_snapshots


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class _NoCloseSession:
    """Wraps a SQLAlchemy Session but ignores close() so the test fixture
    retains control over the session lifecycle."""

    def __init__(self, real_db):
        self._db = real_db

    def close(self):
        pass  # intentional no-op

    def __getattr__(self, name):
        return getattr(self._db, name)


def _create_user(db, username="johndoe", email="john@example.com"):
    repo = UserRepository(db)
    return repo.create(
        UserCreate(
            first_name="John",
            last_name="Doe",
            email=email,
            username=username,
            password="password123",
        ),
        get_password_hash("password123"),
    )


def _create_snapshot(db, user_id, snap_date, portfolio_value, positions_value, cash):
    repo = PortfolioRepository(db)
    return repo.create_snapshot(
        PortfolioSnapshotCreate(
            user_id=user_id,
            snapshot_date=snap_date,
            portfolio_value=portfolio_value,
            positions_value=positions_value,
            cash_balance=cash,
        )
    )


def _create_position(db, user_id, symbol, quantity, average_price):
    repo = PositionRepository(db)
    return repo.create(
        user_id=user_id,
        symbol=symbol,
        quantity=quantity,
        average_price=average_price,
    )


# ---------------------------------------------------------------------------
# YFinanceClient.get_historical_closes
# ---------------------------------------------------------------------------

class TestGetHistoricalCloses:
    """Tests for the batch historical price fetcher."""

    @pytest.fixture
    def client(self):
        return YFinanceClient()

    @pytest.mark.asyncio
    async def test_empty_symbols_returns_empty(self, client):
        result = await client.get_historical_closes([], date(2024, 1, 1), date(2024, 1, 5))
        assert result == {}

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_single_symbol_flat_columns(self, mock_download, client):
        """Single symbol where yf.download returns flat columns."""
        import pandas as pd

        dates = pd.to_datetime(["2024-01-02", "2024-01-03"])
        df = pd.DataFrame(
            {"Close": [150.0, 155.0], "Open": [149.0, 151.0]},
            index=dates,
        )
        mock_download.return_value = df

        result = await client.get_historical_closes(
            ["AAPL"], date(2024, 1, 2), date(2024, 1, 3)
        )

        assert "AAPL" in result
        assert result["AAPL"][date(2024, 1, 2)] == 150.0
        assert result["AAPL"][date(2024, 1, 3)] == 155.0

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_single_symbol_multiindex_columns(self, mock_download, client):
        """Single symbol where yf.download returns MultiIndex columns."""
        import pandas as pd

        dates = pd.to_datetime(["2024-01-02", "2024-01-03"])
        arrays = [["Close", "Close", "Open", "Open"], ["AAPL", "AAPL", "AAPL", "AAPL"]]
        # Build a proper MultiIndex DataFrame with just Close
        close_data = pd.DataFrame(
            {"Close": [150.0, 155.0]}, index=dates
        )
        # Wrap in MultiIndex so df["Close"] returns a DataFrame
        mi = pd.MultiIndex.from_tuples([("Close", "AAPL"), ("Open", "AAPL")])
        df = pd.DataFrame(
            [[150.0, 149.0], [155.0, 151.0]],
            index=dates,
            columns=mi,
        )
        mock_download.return_value = df

        result = await client.get_historical_closes(
            ["AAPL"], date(2024, 1, 2), date(2024, 1, 3)
        )

        assert "AAPL" in result
        assert result["AAPL"][date(2024, 1, 2)] == 150.0
        assert result["AAPL"][date(2024, 1, 3)] == 155.0

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_multiple_symbols(self, mock_download, client):
        """Multiple symbols with MultiIndex columns."""
        import pandas as pd

        dates = pd.to_datetime(["2024-01-02", "2024-01-03"])
        mi = pd.MultiIndex.from_tuples([
            ("Close", "AAPL"), ("Close", "GOOGL"),
            ("Open", "AAPL"), ("Open", "GOOGL"),
        ])
        df = pd.DataFrame(
            [
                [150.0, 2800.0, 149.0, 2790.0],
                [155.0, 2850.0, 151.0, 2810.0],
            ],
            index=dates,
            columns=mi,
        )
        mock_download.return_value = df

        result = await client.get_historical_closes(
            ["AAPL", "GOOGL"], date(2024, 1, 2), date(2024, 1, 3)
        )

        assert result["AAPL"][date(2024, 1, 2)] == 150.0
        assert result["AAPL"][date(2024, 1, 3)] == 155.0
        assert result["GOOGL"][date(2024, 1, 2)] == 2800.0
        assert result["GOOGL"][date(2024, 1, 3)] == 2850.0

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_empty_dataframe(self, mock_download, client):
        """yf.download returns empty DataFrame."""
        import pandas as pd

        mock_download.return_value = pd.DataFrame()

        result = await client.get_historical_closes(
            ["AAPL"], date(2024, 1, 2), date(2024, 1, 3)
        )
        assert result == {}

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_download_exception_propagates(self, mock_download, client):
        """yf.download exception should propagate so the caller can decide."""
        mock_download.side_effect = Exception("network error")

        with pytest.raises(Exception, match="network error"):
            await client.get_historical_closes(
                ["AAPL"], date(2024, 1, 2), date(2024, 1, 3)
            )

    @pytest.mark.asyncio
    @patch("app.domains.stocks.external.yf.download")
    async def test_missing_symbol_in_multiindex(self, mock_download, client):
        """One of the requested symbols is missing from the result."""
        import pandas as pd

        dates = pd.to_datetime(["2024-01-02"])
        mi = pd.MultiIndex.from_tuples([("Close", "AAPL"), ("Open", "AAPL")])
        df = pd.DataFrame([[150.0, 149.0]], index=dates, columns=mi)
        mock_download.return_value = df

        result = await client.get_historical_closes(
            ["AAPL", "MISSING"], date(2024, 1, 2), date(2024, 1, 2)
        )

        assert "AAPL" in result
        assert "MISSING" not in result


# ---------------------------------------------------------------------------
# backfill_missing_snapshots
# ---------------------------------------------------------------------------

class TestBackfillMissingSnapshots:
    """Tests for the historical reconstruction backfill."""

    @pytest.fixture
    def user(self, db):
        return _create_user(db)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.SessionLocal")
    async def test_no_existing_snapshots(self, mock_session_local, db):
        """When there are no snapshots at all, backfill should do nothing."""
        mock_session_local.return_value = _NoCloseSession(db)

        await backfill_missing_snapshots()

        # No snapshots should have been created
        count = db.query(PortfolioSnapshot).count()
        assert count == 0

    @pytest.mark.asyncio
    @patch("app.core.scheduler.SessionLocal")
    async def test_no_gap(self, mock_session_local, db, user):
        """When the latest snapshot is yesterday or later, no backfill needed."""
        mock_session_local.return_value = _NoCloseSession(db)
        yesterday = today_et() - timedelta(days=1)
        _create_snapshot(db, user.id, yesterday, 100000, 0, 100000)

        await backfill_missing_snapshots()

        count = db.query(PortfolioSnapshot).count()
        assert count == 1  # only the original

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_backfill_reconstructs_values(self, mock_session_local, mock_hist, db, user):
        """
        3-day gap with positions — backfill should reconstruct portfolio values
        using historical prices, not carry forward.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        # User holds 10 AAPL, 5 GOOGL, has $80,000 cash
        _create_position(db, user.id, "AAPL", 10, 150.0)
        _create_position(db, user.id, "GOOGL", 5, 2800.0)

        # Last snapshot was 4 days ago
        four_days_ago = today_et() - timedelta(days=4)
        _create_snapshot(db, user.id, four_days_ago, 94000 + 80000, 94000, 80000)

        # Historical prices for the 3 gap days
        three_days_ago = today_et() - timedelta(days=3)
        two_days_ago = today_et() - timedelta(days=2)
        yesterday = today_et() - timedelta(days=1)

        mock_hist.return_value = {
            "AAPL": {
                three_days_ago: 155.0,
                two_days_ago: 160.0,
                yesterday: 158.0,
            },
            "GOOGL": {
                three_days_ago: 2850.0,
                two_days_ago: 2900.0,
                yesterday: 2870.0,
            },
        }

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        # Day 1: 10*155 + 5*2850 = 1550 + 14250 = 15800 + 80000 = 95800
        snap1 = repo.get_snapshot_by_date(user.id, three_days_ago)
        assert snap1 is not None
        assert snap1.positions_value == pytest.approx(15800.0)
        assert snap1.portfolio_value == pytest.approx(95800.0)
        assert snap1.cash_balance == 80000.0

        # Day 2: 10*160 + 5*2900 = 1600 + 14500 = 16100 + 80000 = 96100
        snap2 = repo.get_snapshot_by_date(user.id, two_days_ago)
        assert snap2 is not None
        assert snap2.positions_value == pytest.approx(16100.0)
        assert snap2.portfolio_value == pytest.approx(96100.0)

        # Day 3: 10*158 + 5*2870 = 1580 + 14350 = 15930 + 80000 = 95930
        snap3 = repo.get_snapshot_by_date(user.id, yesterday)
        assert snap3 is not None
        assert snap3.positions_value == pytest.approx(15930.0)
        assert snap3.portfolio_value == pytest.approx(95930.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_weekend_uses_friday_close(self, mock_session_local, mock_hist, db, user):
        """
        On a weekend, yfinance has no data. Backfill should use Friday's
        close, not fall back to average_price.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 100.0)  # avg_price = 100

        # Snapshot from Thursday. Gap = Fri, Sat, Sun (3 days through Sunday).
        # We need yesterday to be Sunday for this to work, so let's just
        # use concrete dates.
        thursday = date(2024, 6, 20)  # Thursday
        friday = date(2024, 6, 21)
        saturday = date(2024, 6, 22)
        sunday = date(2024, 6, 23)

        _create_snapshot(db, user.id, thursday, 101500, 1500, 100000)

        # yfinance only has Friday's data (markets closed Sat/Sun)
        mock_hist.return_value = {
            "AAPL": {friday: 155.0},
        }

        # Patch today_et() to return Monday June 24
        monday = date(2024, 6, 24)
        with patch("app.core.scheduler.date") as mock_date:
            mock_date.today.return_value = monday
            mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
            await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        # Friday: 10 * 155 = 1550
        snap_fri = repo.get_snapshot_by_date(user.id, friday)
        assert snap_fri is not None
        assert snap_fri.positions_value == pytest.approx(1550.0)

        # Saturday: no market data → should use Friday's 155.0, NOT avg 100.0
        snap_sat = repo.get_snapshot_by_date(user.id, saturday)
        assert snap_sat is not None
        assert snap_sat.positions_value == pytest.approx(1550.0)  # same as Friday
        assert snap_sat.positions_value != 1000.0  # would be 10*100 if fallback used

        # Sunday: same
        snap_sun = repo.get_snapshot_by_date(user.id, sunday)
        assert snap_sun is not None
        assert snap_sun.positions_value == pytest.approx(1550.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_fallback_to_average_price_when_no_data(
        self, mock_session_local, mock_hist, db, user
    ):
        """
        If the batch succeeds for at least one symbol, symbols that still have
        no history can fall back to average_price.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 150.0)
        _create_position(db, user.id, "OBSCURE", 20, 50.0)

        yesterday = today_et() - timedelta(days=1)
        two_days_ago = today_et() - timedelta(days=2)
        _create_snapshot(db, user.id, two_days_ago, 102500, 2500, 100000)

        # yfinance succeeds for AAPL, but OBSCURE is still missing.
        mock_hist.return_value = {
            "AAPL": {yesterday: 160.0},
        }

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)
        snap = repo.get_snapshot_by_date(user.id, yesterday)
        assert snap is not None
        # AAPL uses historical close, OBSCURE falls back to average_price.
        assert snap.positions_value == pytest.approx(2600.0)
        assert snap.portfolio_value == pytest.approx(102600.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_user_with_no_positions(self, mock_session_local, mock_hist, db, user):
        """User with no positions should get cash-only snapshots."""
        mock_session_local.return_value = _NoCloseSession(db)

        yesterday = today_et() - timedelta(days=1)
        two_days_ago = today_et() - timedelta(days=2)
        _create_snapshot(db, user.id, two_days_ago, 100000, 0, 100000)

        mock_hist.return_value = {}

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)
        snap = repo.get_snapshot_by_date(user.id, yesterday)
        assert snap is not None
        assert snap.positions_value == 0.0
        assert snap.portfolio_value == 100000.0
        assert snap.cash_balance == 100000.0

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_multiple_users(self, mock_session_local, mock_hist, db):
        """Backfill should work for multiple users independently."""
        mock_session_local.return_value = _NoCloseSession(db)

        user1 = _create_user(db, "alice", "alice@example.com")
        user2 = _create_user(db, "bob", "bob@example.com")

        _create_position(db, user1.id, "AAPL", 10, 150.0)
        _create_position(db, user2.id, "MSFT", 20, 300.0)

        yesterday = today_et() - timedelta(days=1)
        two_days_ago = today_et() - timedelta(days=2)

        _create_snapshot(db, user1.id, two_days_ago, 101500, 1500, 100000)
        _create_snapshot(db, user2.id, two_days_ago, 106000, 6000, 100000)

        mock_hist.return_value = {
            "AAPL": {yesterday: 160.0},
            "MSFT": {yesterday: 310.0},
        }

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        snap1 = repo.get_snapshot_by_date(user1.id, yesterday)
        assert snap1 is not None
        assert snap1.positions_value == pytest.approx(1600.0)  # 10 * 160
        assert snap1.portfolio_value == pytest.approx(101600.0)

        snap2 = repo.get_snapshot_by_date(user2.id, yesterday)
        assert snap2 is not None
        assert snap2.positions_value == pytest.approx(6200.0)  # 20 * 310
        assert snap2.portfolio_value == pytest.approx(106200.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_existing_snapshot_not_overwritten(
        self, mock_session_local, mock_hist, db, user
    ):
        """If a snapshot already exists for a date, it should not be replaced."""
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 150.0)

        yesterday = today_et() - timedelta(days=1)
        three_days_ago = today_et() - timedelta(days=3)

        _create_snapshot(db, user.id, three_days_ago, 101500, 1500, 100000)
        # Manually create yesterday's snapshot with a specific value
        _create_snapshot(db, user.id, yesterday, 99999, 99999, 0)

        mock_hist.return_value = {
            "AAPL": {yesterday: 200.0},
        }

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)
        snap = repo.get_snapshot_by_date(user.id, yesterday)
        # Should still be the original value, not overwritten
        assert snap.portfolio_value == pytest.approx(99999.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_gap_starting_on_weekend_uses_pre_gap_close(
        self, mock_session_local, mock_hist, db, user
    ):
        """
        P1 fix: Last snapshot on Friday, DB pauses over weekend.
        Gap starts Saturday — the fetch window should include pre-gap
        days so Saturday/Sunday use Friday's close, not average_price.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 100.0)  # avg_price = 100

        friday = date(2024, 6, 21)
        saturday = date(2024, 6, 22)
        sunday = date(2024, 6, 23)

        # Last snapshot is Friday itself
        _create_snapshot(db, user.id, friday, 101550, 1550, 100000)

        # yfinance returns Friday's close in the buffer window (pre-gap),
        # but nothing for Sat/Sun (markets closed)
        mock_hist.return_value = {
            "AAPL": {friday: 155.0},
        }

        # Patch today_et() to return Monday June 24
        monday = date(2024, 6, 24)
        with patch("app.core.scheduler.date") as mock_date:
            mock_date.today.return_value = monday
            mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
            await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        # Saturday: should use Friday's 155.0 from the buffer, NOT avg 100.0
        snap_sat = repo.get_snapshot_by_date(user.id, saturday)
        assert snap_sat is not None
        assert snap_sat.positions_value == pytest.approx(1550.0)  # 10 * 155
        assert snap_sat.positions_value != 1000.0  # would be 10*100 if fallback used

        # Sunday: same
        snap_sun = repo.get_snapshot_by_date(user.id, sunday)
        assert snap_sun is not None
        assert snap_sun.positions_value == pytest.approx(1550.0)

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_per_user_gap_detection(self, mock_session_local, mock_hist, db):
        """
        P1 fix: One user is current (snapshot for yesterday), another has a
        gap. The lagging user should still be backfilled.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        current_user = _create_user(db, "current", "current@example.com")
        lagging_user = _create_user(db, "lagging", "lagging@example.com")

        _create_position(db, lagging_user.id, "AAPL", 10, 150.0)

        yesterday = today_et() - timedelta(days=1)
        three_days_ago = today_et() - timedelta(days=3)

        # current_user has yesterday's snapshot — no gap
        _create_snapshot(db, current_user.id, yesterday, 100000, 0, 100000)
        # lagging_user's last snapshot is 3 days old
        _create_snapshot(db, lagging_user.id, three_days_ago, 101500, 1500, 100000)

        two_days_ago = today_et() - timedelta(days=2)

        mock_hist.return_value = {
            "AAPL": {two_days_ago: 160.0, yesterday: 158.0},
        }

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        # lagging_user should have new snapshots
        snap1 = repo.get_snapshot_by_date(lagging_user.id, two_days_ago)
        assert snap1 is not None
        assert snap1.positions_value == pytest.approx(1600.0)  # 10 * 160

        snap2 = repo.get_snapshot_by_date(lagging_user.id, yesterday)
        assert snap2 is not None
        assert snap2.positions_value == pytest.approx(1580.0)  # 10 * 158

        # current_user should NOT have gained extra snapshots
        current_count = db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.user_id == current_user.id
        ).count()
        assert current_count == 1

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_yfinance_failure_aborts_backfill(
        self, mock_session_local, mock_hist, db, user
    ):
        """
        P1 fix: If yfinance raises an exception, backfill should abort
        rather than silently writing snapshots from average_price.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 150.0)

        yesterday = today_et() - timedelta(days=1)
        two_days_ago = today_et() - timedelta(days=2)
        _create_snapshot(db, user.id, two_days_ago, 101500, 1500, 100000)

        mock_hist.side_effect = Exception("Yahoo Finance unavailable")

        await backfill_missing_snapshots()

        # No new snapshots should have been created
        repo = PortfolioRepository(db)
        snap = repo.get_snapshot_by_date(user.id, yesterday)
        assert snap is None

        count = db.query(PortfolioSnapshot).count()
        assert count == 1  # only the original

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_all_empty_historical_batches_abort_backfill(
        self, mock_session_local, mock_hist, db, user
    ):
        """
        If every historical price batch is empty even after widening the
        lookback window, backfill should abort instead of writing cost-basis
        snapshots for the whole portfolio.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 150.0)

        yesterday = today_et() - timedelta(days=1)
        two_days_ago = today_et() - timedelta(days=2)
        _create_snapshot(db, user.id, two_days_ago, 101500, 1500, 100000)

        mock_hist.return_value = {}

        await backfill_missing_snapshots()

        repo = PortfolioRepository(db)
        assert repo.get_snapshot_by_date(user.id, yesterday) is None
        assert db.query(PortfolioSnapshot).count() == 1
        assert mock_hist.await_count == 4  # 7 -> 14 -> 28 -> 30 day lookbacks

    @pytest.mark.asyncio
    @patch("app.core.scheduler.YFinanceClient.get_historical_closes", new_callable=AsyncMock)
    @patch("app.core.scheduler.SessionLocal")
    async def test_backfill_expands_lookback_until_pre_gap_close_found(
        self, mock_session_local, mock_hist, db, user
    ):
        """
        If the first fetch lacks a usable pre-gap close, backfill should widen
        the historical window before falling back to average_price.
        """
        mock_session_local.return_value = _NoCloseSession(db)

        _create_position(db, user.id, "AAPL", 10, 100.0)

        friday = date(2024, 1, 5)
        saturday = date(2024, 1, 6)
        sunday = date(2024, 1, 7)
        monday = date(2024, 1, 8)
        tuesday = date(2024, 1, 9)

        _create_snapshot(db, user.id, friday, 101550, 1550, 100000)

        mock_hist.side_effect = [
            {"AAPL": {tuesday: 160.0}},
            {"AAPL": {friday: 155.0, tuesday: 160.0}},
        ]

        with patch("app.core.scheduler.date") as mock_date:
            mock_date.today.return_value = date(2024, 1, 10)
            mock_date.side_effect = lambda *a, **kw: date(*a, **kw)
            await backfill_missing_snapshots()

        repo = PortfolioRepository(db)

        assert repo.get_snapshot_by_date(user.id, saturday).positions_value == pytest.approx(1550.0)
        assert repo.get_snapshot_by_date(user.id, sunday).positions_value == pytest.approx(1550.0)
        assert repo.get_snapshot_by_date(user.id, monday).positions_value == pytest.approx(1550.0)
        assert repo.get_snapshot_by_date(user.id, tuesday).positions_value == pytest.approx(1600.0)
        assert mock_hist.await_count == 2


class TestPortfolioRepository:
    def test_create_snapshot_is_idempotent(self, db):
        """Creating the same snapshot twice should return the existing row."""
        user = _create_user(db)
        repo = PortfolioRepository(db)
        snap_date = today_et()

        snapshot_data = PortfolioSnapshotCreate(
            user_id=user.id,
            snapshot_date=snap_date,
            portfolio_value=101500.0,
            positions_value=1500.0,
            cash_balance=100000.0,
        )

        first = repo.create_snapshot(snapshot_data)
        second = repo.create_snapshot(snapshot_data)

        assert first.id == second.id
        assert db.query(PortfolioSnapshot).count() == 1
