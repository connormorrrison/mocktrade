#!/usr/bin/env bash
set -e

# MockTrade Setup & Launch Script
# Starts both the backend (FastAPI) and frontend (React/Vite) servers.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cleanup() {
    echo ""
    echo "Shutting down..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# --- Backend setup ---
echo "=== Setting up backend ==="

if [ ! -d "$BACKEND_DIR/venv" ] || ! "$BACKEND_DIR/venv/bin/python3" --version &>/dev/null; then
    echo "Creating Python virtual environment..."
    rm -rf "$BACKEND_DIR/venv"
    python3 -m venv "$BACKEND_DIR/venv"
fi

source "$BACKEND_DIR/venv/bin/activate"

echo "Installing backend dependencies..."
pip install -q -r "$BACKEND_DIR/requirements.txt"

echo "Starting backend (uvicorn) on http://localhost:8000 ..."
cd "$BACKEND_DIR"
uvicorn app.main:app --reload &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# --- Frontend setup ---
echo ""
echo "=== Setting up frontend ==="

echo "Installing frontend dependencies..."
npm --prefix "$FRONTEND_DIR" install --silent

echo "Starting frontend (vite) on http://localhost:5173 ..."
npm --prefix "$FRONTEND_DIR" run dev &
FRONTEND_PID=$!

# --- Wait ---
echo ""
echo "=== MockTrade is running ==="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services."

wait
