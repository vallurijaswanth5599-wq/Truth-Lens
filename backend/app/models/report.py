"""
Report ORM Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional for anonymous queries
    
    input_type = Column(String, index=True, nullable=False) # text, url, image, video, document
    content = Column(Text, nullable=False)
    claim = Column(Text, nullable=False)
    
    recommendation = Column(String, index=True, nullable=False) # Safe to Share, Share with Caution, Do Not Share, etc.
    credibility_score = Column(Integer, nullable=False)
    confidence_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False) # Low, Medium, High
    domain = Column(String, nullable=False)
    is_high_impact = Column(Boolean, default=False)
    is_saved = Column(Boolean, default=False)
    
    report_data = Column(JSON, nullable=False) # Full structured json payload
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="reports")
