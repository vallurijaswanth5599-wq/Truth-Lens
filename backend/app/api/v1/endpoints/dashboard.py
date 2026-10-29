"""
Dashboard & Analytics Endpoints (/dashboard)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.report import Report
from app.schemas.report import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Report).count()
    safe = db.query(Report).filter(Report.recommendation == "Safe to Share").count()
    caution = db.query(Report).filter(Report.recommendation == "Share with Caution").count()
    no_share = db.query(Report).filter(Report.recommendation == "Do Not Share").count()
    high_risk = db.query(Report).filter(Report.risk_level == "High").count()
    
    avg_cred = db.query(func.avg(Report.credibility_score)).scalar() or 0.0

    # Domain breakdown
    domain_counts = {}
    domains = db.query(Report.domain, func.count(Report.id)).group_by(Report.domain).all()
    for dom, count in domains:
        if dom:
            domain_counts[dom] = count

    return {
        "total_verifications": total,
        "safe_to_share_count": safe,
        "share_with_caution_count": caution,
        "do_not_share_count": no_share,
        "high_risk_flagged": high_risk,
        "average_credibility": round(float(avg_cred), 1),
        "domain_breakdown": domain_counts
    }
