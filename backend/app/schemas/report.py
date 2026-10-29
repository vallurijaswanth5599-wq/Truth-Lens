"""
Pydantic Schemas for Reports and Dashboard
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ReportListItem(BaseModel):
    id: int
    request_id: str
    input_type: str
    claim: str
    recommendation: str
    credibility_score: int
    confidence_score: int
    risk_level: str
    domain: str
    is_saved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ReportDetail(ReportListItem):
    content: str
    is_high_impact: bool
    report_data: Dict[str, Any]

class DashboardStats(BaseModel):
    total_verifications: int
    safe_to_share_count: int
    share_with_caution_count: int
    do_not_share_count: int
    high_risk_flagged: int
    average_credibility: float
    domain_breakdown: Dict[str, int]
