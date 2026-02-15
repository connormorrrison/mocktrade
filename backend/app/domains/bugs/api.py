# app/domains/bugs/api.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.core.dependencies import get_db, get_optional_user
from app.domains.auth.models import User
from app.domains.bugs.repositories import BugReportRepository
from app.domains.bugs.schemas import BugReportCreate, BugReportResponse

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/report", response_model=BugReportResponse, status_code=status.HTTP_201_CREATED)
async def create_bug_report(
    bug_report: BugReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Submit a bug report.
    Can be submitted by authenticated users or anonymous users.
    """
    try:
        bug_repo = BugReportRepository(db)
        user_id = current_user.id if current_user else None

        created_report = bug_repo.create(bug_report, user_id)

        logger.info(f"Bug report created: ID={created_report.id}, User={user_id or 'anonymous'}")
        return created_report

    except Exception as e:
        logger.error(f"Error creating bug report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit bug report."
        )
