from app.infrastructure.database import SessionLocal
from sqlalchemy import text
import asyncio
from app.domains.portfolio.services import PortfolioService

db = SessionLocal()
try:
    print("=== DATABASE INSPECTION ===")
    
    # Check if portfolio_snapshots table exists
    result = db.execute(text('SELECT name FROM sqlite_master WHERE type="table" AND name="portfolio_snapshots";'))
    table_exists = result.fetchone()
    print('Portfolio snapshots table exists:', bool(table_exists))
    
    # Show table schema
    if table_exists:
        schema_result = db.execute(text('PRAGMA table_info(portfolio_snapshots);'))
        columns = schema_result.fetchall()
        print('\nTable schema:')
        for col in columns:
            print(f'  {col[1]} ({col[2]}) - {"NOT NULL" if col[3] else "NULLABLE"} - {"PK" if col[5] else ""}')
    
    # Count total snapshots
    count_result = db.execute(text('SELECT COUNT(*) FROM portfolio_snapshots;'))
    total_count = count_result.fetchone()[0]
    print(f'\nTotal portfolio snapshots: {total_count}')
    
    # Show all snapshots (since there are likely few/none)
    all_snapshots = db.execute(text('SELECT * FROM portfolio_snapshots ORDER BY snapshot_date DESC;'))
    snapshots = all_snapshots.fetchall()
    print(f'\nAll snapshots ({len(snapshots)}):')
    for i, snapshot in enumerate(snapshots):
        print(f'  {i+1}. ID: {snapshot[0]}, User: {snapshot[1]}, Date: {snapshot[2]}, Portfolio: ${snapshot[3]:.2f}, Positions: ${snapshot[4]:.2f}, Cash: ${snapshot[5]:.2f}')
    
    # Check users table
    user_result = db.execute(text('SELECT id, username, cash_balance FROM users;'))
    users = user_result.fetchall()
    print(f'\nUsers ({len(users)}):')
    for user in users:
        print(f'  ID: {user[0]}, Username: {user[1]}, Cash: ${user[2]:.2f}')
    
    # Check positions table
    try:
        positions_result = db.execute(text('SELECT user_id, symbol, quantity, average_price FROM positions;'))
        positions = positions_result.fetchall()
        print(f'\nPositions ({len(positions)}):')
        for pos in positions:
            print(f'  User: {pos[0]}, Symbol: {pos[1]}, Qty: {pos[2]}, Avg Price: ${pos[3]:.2f}')
    except Exception as e:
        print(f'\nPositions table error: {e}')
    
    print("\n=== TESTING API SERVICE ===")
    
    # Test the portfolio service
    if users:
        user_id = users[0][0]  # Use first user
        print(f'\nTesting portfolio history for user {user_id}...')
        
        portfolio_service = PortfolioService(db)
        
        async def test_history():
            try:
                history = portfolio_service.get_portfolio_history(user_id, "1mo")
                print(f'History returned: {len(history.history)} points')
                print(f'Period: {history.period}')
                
                for i, point in enumerate(history.history[:5]):  # Show first 5
                    print(f'  {i+1}. {point.date}: Portfolio: ${point.portfolio_value:.2f}, Positions: ${point.positions_value:.2f}, Cash: ${point.cash_balance:.2f}')
                
                if len(history.history) > 5:
                    print(f'  ... and {len(history.history) - 5} more points')
                    
            except Exception as e:
                print(f'Error getting history: {e}')
        
        # Run async test
        asyncio.run(test_history())
        
finally:
    db.close()