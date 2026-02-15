# app/core/scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
import logging

from app.infrastructure.database import SessionLocal
from app.domains.portfolio.services import PortfolioService
from app.domains.auth.repositories import UserRepository

logger = logging.getLogger(__name__)

# global scheduler instance
scheduler = AsyncIOScheduler()


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
