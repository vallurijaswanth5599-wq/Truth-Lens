"""
TruthLens FastAPI Backend Application Entrypoint
"""
import sys
import time
import json
import uuid
import asyncio
from pathlib import Path

# Ensure backend directory is in sys.path for robust relative/absolute imports
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base
from app.services.claim_service import extract_claims
from app.services.tavily_service import search_claim
from app.services.source_trust_service import score_and_filter_sources, compute_source_agreement
from app.services.gemini_service import analyze_with_gemini, extract_visual_context
from app.services.forensics_service import analyze_media_forensics
from app.services.url_service import audit_url_reputation
from app.services.report_service import build_report

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Create tables on startup safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as err:
    print(f"[TruthLens Warning] Database table creation fallback: {err}")

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "services": {
            "tavily": bool(settings.TAVILY_API_KEY),
            "gemini": bool(settings.GEMINI_API_KEY)
        },
        "ready": bool(settings.GEMINI_API_KEY)
    }

@app.post("/api/verify")
@app.post("/verify")
async def verify_streaming_handler(request: Request):
    try:
        data = await request.json()
    except Exception:
        data = {}

    input_type = data.get("type", "text")
    content = (data.get("content") or "").strip()
    file_meta = data.get("fileMetadata")
    file_data = data.get("fileData")

    if not content and not file_data:
        content = "Sample statement verification"

    async def sse_generator():
        req_id = f"vt-{uuid.uuid4().hex[:8]}"
        start_time = time.time()
        time_str = time.strftime("%H:%M:%S")

        p0 = {
            "type": "progress",
            "stage": 0,
            "name": "Claim Extraction",
            "desc": "Extracting and decomposing claims...",
            "logs": [f"[{time_str}] Request ID: {req_id}"]
        }
        yield f"data: {json.dumps(p0)}\n\n"
        await asyncio.sleep(0.05)

        visual_ctx = None
        if file_data and (input_type == "image" or "data:image" in str(file_data)):
            p_vis = {
                "type": "progress",
                "stage": 0,
                "name": "Gemini Vision Pre-pass",
                "desc": "Extracting visual description, OCR, and keywords...",
                "logs": ["Analyzing image with Gemini Vision"]
            }
            yield f"data: {json.dumps(p_vis)}\n\n"
            visual_ctx = await extract_visual_context(file_data, file_meta)

        claim, queries, domain, is_high_impact = extract_claims(content, input_type, file_meta, visual_ctx)

        p1 = {
            "type": "progress",
            "stage": 1,
            "name": "Search Planning",
            "desc": f"Generated {len(queries)} search queries...",
            "logs": [f"Queries: {queries}"]
        }
        yield f"data: {json.dumps(p1)}\n\n"
        await asyncio.sleep(0.05)

        p2 = {
            "type": "progress",
            "stage": 2,
            "name": "Web Retrieval",
            "desc": "Querying live sources via Tavily & fallbacks...",
            "logs": ["Executing parallel searches"]
        }
        yield f"data: {json.dumps(p2)}\n\n"
        raw_results, tavily_ans = await search_claim(queries)

        p3 = {
            "type": "progress",
            "stage": 3,
            "name": "Domain Trust Evaluation",
            "desc": f"Evaluating {len(raw_results)} sources across 300+ domain trust tiers...",
            "logs": ["Filtering sources by domain reputation"]
        }
        yield f"data: {json.dumps(p3)}\n\n"
        trusted_sources = score_and_filter_sources(raw_results, claim)
        source_agreement = compute_source_agreement(trusted_sources, claim)

        p4 = {
            "type": "progress",
            "stage": 4,
            "name": "Gemini AI Evidence Reasoning",
            "desc": "Reasoning strictly over retrieved evidence...",
            "logs": ["Evidence-grounded claim reasoning active"]
        }
        yield f"data: {json.dumps(p4)}\n\n"
        extras = {
            "tavily_answer": tavily_ans,
            "source_agreement": source_agreement,
            "file_data": file_data,
            "file_metadata": file_meta
        }
        analysis = await analyze_with_gemini(claim, trusted_sources, input_type, domain, extras)

        forensics = None
        if input_type in ["image", "video", "audio", "document"]:
            p5 = {
                "type": "progress",
                "stage": 5,
                "name": "Media Forensics",
                "desc": "Inspecting digital watermarks, EXIF metadata, and ELA signals...",
                "logs": ["Analyzing forensic markers"]
            }
            yield f"data: {json.dumps(p5)}\n\n"
            forensics = analyze_media_forensics(input_type, file_meta, content, claim, analysis, file_data)

        url_metrics = None
        if input_type == "url" or content.startswith("http://") or content.startswith("https://"):
            url_metrics = audit_url_reputation(content)

        report = build_report(
            request_id=req_id,
            start_time=start_time,
            claim=claim,
            input_type=input_type,
            content=content,
            analysis=analysis,
            trusted_sources=trusted_sources,
            forensics=forensics,
            url_metrics=url_metrics
        )

        p6 = {
            "type": "progress",
            "stage": 6,
            "name": "Report Assembly",
            "desc": "Finalizing executive verification scorecard...",
            "logs": ["Report complete"]
        }
        yield f"data: {json.dumps(p6)}\n\n"
        yield f"data: {json.dumps({'type': 'complete', 'report': report})}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
