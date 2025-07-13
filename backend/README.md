# MockTrade Backend

FastAPI backend for the MockTrade application.

## Setup

1. **Create and activate virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## Testing

```bash
pytest
```

## Database

The development database (`development.db`) is automatically created when you start the server.