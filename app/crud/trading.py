# app/crud/trading.py

from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from fastapi import HTTPException
from app.models.trading import User, Position, Transaction
