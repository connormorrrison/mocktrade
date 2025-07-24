import asyncio
import logging
from datetime import date, time, datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.user import User
from app.services.portfolio_service import PortfolioService

logger = logging.getLogger(__name__)

class PortfolioSnapshotScheduler:
    """Background scheduler for taking daily portfolio snapshots."""
    
    def __init__(self):
        self.running = False
        self.snapshot_time = time(17, 0)  # 5:00 PM daily (after market close)
    
    async def create_snapshots_for_all_users(self):
        """Create portfolio snapshots for all active users."""
        try:
            db = next(get_db())
            users = db.query(User).filter(User.is_active == True).all()
            
            logger.info(f"Creating portfolio snapshots for {len(users)} active users")
            
            for user in users:
                try:
                    await PortfolioService.create_portfolio_snapshot(db, user.id)
                    logger.info(f"Created snapshot for user {user.username}")
                except Exception as e:
                    logger.error(f"Failed to create snapshot for user {user.username}: {e}")
                    continue
            
            logger.info("Daily portfolio snapshots completed")
            
        except Exception as e:
            logger.error(f"Error in daily snapshot job: {e}")
        finally:
            db.close()
    
    async def run_scheduler(self):
        """Run the daily snapshot scheduler."""
        self.running = True
        logger.info(f"Portfolio snapshot scheduler started. Will run daily at {self.snapshot_time}")
        
        while self.running:
            try:
                now = datetime.now()
                target_time = datetime.combine(now.date(), self.snapshot_time)
                
                # If we've passed today's target time, schedule for tomorrow
                if now > target_time:
                    target_time = target_time + timedelta(days=1)
                
                sleep_seconds = (target_time - now).total_seconds()
                logger.info(f"Next snapshot scheduled for {target_time} (in {sleep_seconds/3600:.1f} hours)")
                
                # Sleep until target time
                await asyncio.sleep(sleep_seconds)
                
                # Run the snapshot job
                if self.running:  # Check if still running after sleep
                    await self.create_snapshots_for_all_users()
                
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                # Sleep for 1 hour before retrying on error
                await asyncio.sleep(3600)
    
    def stop(self):
        """Stop the scheduler."""
        self.running = False
        logger.info("Portfolio snapshot scheduler stopped")

# Global scheduler instance
portfolio_scheduler = PortfolioSnapshotScheduler()

async def start_background_tasks():
    """Start all background tasks."""
    logger.info("Starting background tasks...")
    
    # Start portfolio snapshot scheduler
    asyncio.create_task(portfolio_scheduler.run_scheduler())
    
    logger.info("Background tasks started")

async def stop_background_tasks():
    """Stop all background tasks."""
    logger.info("Stopping background tasks...")
    portfolio_scheduler.stop()
    logger.info("Background tasks stopped")