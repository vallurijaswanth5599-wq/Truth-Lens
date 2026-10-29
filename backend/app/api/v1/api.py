"""
FastAPI V1 API Router Collector
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, verify, reports, dashboard, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(verify.router, prefix="/verify", tags=["verify"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
