"""
Verification Endpoints (/verify/text, /verify/url, /verify/image, /verify/video, /verify/document)
"""
import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.verify import VerifyTextRequest, VerifyUrlRequest, VerifyMediaRequest
from app.services.claim_service import extract_claims
from app.services.tavily_service import search_claim
from app.services.source_trust_service import score_and_filter_sources, compute_source_agreement
from app.services.gemini_service import analyze_with_gemini, extract_visual_context
from app.services.forensics_service import analyze_media_forensics
from app.services.url_service import audit_url_reputation
from app.services.report_service import build_report
from app.models.report import Report

router = APIRouter()

@router.post("/text")
async def verify_text(req: VerifyTextRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    req_id = f"vt-{uuid.uuid4().hex[:8]}"

    claim, queries, domain, is_high_impact = extract_claims(req.text, "text")
    raw_results, tavily_ans = await search_claim(queries)
    trusted_sources = score_and_filter_sources(raw_results, claim)
    source_agreement = compute_source_agreement(trusted_sources, claim)

    analysis = await analyze_with_gemini(
        claim, trusted_sources, "text", domain,
        {"tavily_answer": tavily_ans, "source_agreement": source_agreement}
    )

    report = build_report(req_id, start_time, claim, "text", req.text, analysis, trusted_sources)

    # Save to database
    db_report = Report(
        request_id=req_id,
        input_type="text",
        content=req.text,
        claim=claim,
        recommendation=report["recommendation"],
        credibility_score=report["credibilityScore"],
        confidence_score=report["confidenceScore"],
        risk_level=report["riskLevel"],
        domain=domain,
        is_high_impact=is_high_impact,
        report_data=report
    )
    db.add(db_report)
    db.commit()

    return report

@router.post("/url")
async def verify_url(req: VerifyUrlRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    req_id = f"vt-{uuid.uuid4().hex[:8]}"

    claim, queries, domain, is_high_impact = extract_claims(req.url, "url")
    raw_results, tavily_ans = await search_claim(queries)
    trusted_sources = score_and_filter_sources(raw_results, claim)
    url_metrics = audit_url_reputation(req.url)

    analysis = await analyze_with_gemini(
        claim, trusted_sources, "url", domain,
        {"tavily_answer": tavily_ans}
    )

    report = build_report(req_id, start_time, claim, "url", req.url, analysis, trusted_sources, url_metrics=url_metrics)

    db_report = Report(
        request_id=req_id,
        input_type="url",
        content=req.url,
        claim=claim,
        recommendation=report["recommendation"],
        credibility_score=report["credibilityScore"],
        confidence_score=report["confidenceScore"],
        risk_level=report["riskLevel"],
        domain=domain,
        is_high_impact=is_high_impact,
        report_data=report
    )
    db.add(db_report)
    db.commit()

    return report

@router.post("/image")
async def verify_image(req: VerifyMediaRequest, db: Session = Depends(get_db)):
    start_time = time.time()
    req_id = f"vt-{uuid.uuid4().hex[:8]}"

    file_meta = {"name": req.file_name or "uploaded_image.jpg", "size": req.file_size, "type": req.mime_type}
    raw_content = req.prompt or f"[Uploaded Image: {file_meta['name']}]"

    visual_ctx = await extract_visual_context(req.file_data, file_meta)
    claim, queries, domain, is_high_impact = extract_claims(raw_content, "image", file_meta, visual_ctx)

    raw_results, tavily_ans = await search_claim(queries)
    trusted_sources = score_and_filter_sources(raw_results, claim)

    analysis = await analyze_with_gemini(
        claim, trusted_sources, "image", domain,
        {"tavily_answer": tavily_ans, "file_data": req.file_data}
    )

    forensics = analyze_media_forensics("image", file_meta, raw_content, claim, analysis, req.file_data)
    report = build_report(req_id, start_time, claim, "image", raw_content, analysis, trusted_sources, forensics=forensics)

    db_report = Report(
        request_id=req_id,
        input_type="image",
        content=raw_content,
        claim=claim,
        recommendation=report["recommendation"],
        credibility_score=report["credibilityScore"],
        confidence_score=report["confidenceScore"],
        risk_level=report["riskLevel"],
        domain=domain,
        is_high_impact=is_high_impact,
        report_data=report
    )
    db.add(db_report)
    db.commit()

    return report

@router.post("/video")
async def verify_video(req: VerifyMediaRequest, db: Session = Depends(get_db)):
    return await verify_image(req, db)

@router.post("/document")
async def verify_document(req: VerifyMediaRequest, db: Session = Depends(get_db)):
    return await verify_image(req, db)
