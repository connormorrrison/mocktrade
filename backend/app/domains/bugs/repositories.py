# app/domains/bugs/repositories.py

from sqlalchemy.orm import Session
from typing import List, Optional
from app.domains.bugs.models import BugReport
from app.domains.bugs.schemas import BugReportCreate

class BugReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, bug_report: BugReportCreate, user_id: Optional[int] = None) -> BugReport:
        """Create a new bug report"""
        db_bug_report = BugReport(
            user_id=user_id,
            title=bug_report.title,
            description=bug_report.description,
            email=bug_report.email
        )
        self.db.add(db_bug_report)
        self.db.commit()
        self.db.refresh(db_bug_report)
        return db_bug_report

    def get_by_id(self, bug_report_id: int) -> Optional[BugReport]:
        """Get a bug report by ID"""
        return self.db.query(BugReport).filter(BugReport.id == bug_report_id).first()

    def get_all(self, limit: int = 100, offset: int = 0) -> List[BugReport]:
        """Get all bug reports with pagination"""
        return self.db.query(BugReport).order_by(BugReport.created_at.desc()).offset(offset).limit(limit).all()

    def get_by_user(self, user_id: int, limit: int = 100) -> List[BugReport]:
        """Get all bug reports from a specific user"""
        return self.db.query(BugReport).filter(BugReport.user_id == user_id).order_by(BugReport.created_at.desc()).limit(limit).all()

    def delete(self, bug_report_id: int) -> bool:
        """Delete a bug report"""
        bug_report = self.get_by_id(bug_report_id)
        if bug_report:
            self.db.delete(bug_report)
            self.db.commit()
            return True
        return False
