# Developer Guide

This guide explains how to set up and run **MockTrade** locally.

## Prerequisites
- Git
- Node.js (version 14.x or later)
- Python 3.x
- PostgreSQL

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/connormorrrison/mocktrade.git
   cd mocktrade/
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

## Configuration
- Create a `.env` file in the root directory.
- Add the necessary environment variables for your project (e.g., API keys, database URLs).

## Running the Application
1. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Start the frontend:**
   ```bash
   cd frontend/
   npm start
   ```