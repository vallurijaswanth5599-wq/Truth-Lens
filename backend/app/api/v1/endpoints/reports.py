"""
Reports & History Endpoints (/reports)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.report import Report
from app.schemas.report import ReportListItem, ReportDetail

router = APIRouter()

@router.get("", response_model=List[ReportListItem])
def get_reports(
    skip: int = 0, 
    limit: int = 50, 
    input_type: Optional[str] = None, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if input_type:
        query = query.filter(Report.input_type == input_type)
    if search:
        query = query.filter(Report.claim.ilike(f"%{search}%"))
    
    return query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{report_id}", response_model=ReportDetail)
def get_report_by_id(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(
        (Report.request_id == report_id) | (Report.id == int(report_id) if report_id.isdigit() else False)
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/{report_id}/toggle-save")
def toggle_save_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(
        (Report.request_id == report_id) | (Report.id == int(report_id) if report_id.isdigit() else False)
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.is_saved = not report.is_saved
    db.commit()
    return {"status": "success", "is_saved": report.is_saved}
