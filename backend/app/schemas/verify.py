"""
Pydantic Schemas for Verification Requests
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class VerifyTextRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Text claim or statement to verify")

class VerifyUrlRequest(BaseModel):
    url: str = Field(..., description="Target web URL to audit")

class VerifyMediaRequest(BaseModel):
    file_data: Optional[str] = Field(None, description="Base64 data URL of media file")
    file_name: Optional[str] = Field(None, description="Filename")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="MIME type")
    prompt: Optional[str] = Field(None, description="Optional text description or claim")

class VerificationResponse(BaseModel):
    request_id: str
    timestamp: str
    execution_time_ms: int
    input_type: str
    content: str
    claim: str
    recommendation: str
    credibility_score: int
    confidence_score: int
    risk_level: str
    domain: str
    is_high_impact: bool
    explanation: str
    evidence_summary: str
    evidence_for: Optional[str] = None
    evidence_against: Optional[str] = None
    claims: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    forensics: Optional[Dict[str, Any]] = None
    url_metrics: Optional[Dict[str, Any]] = None
