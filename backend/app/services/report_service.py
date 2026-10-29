"""
Report Assembly & Dynamic Multi-Factor Weighted Scoring Service
"""
import time
from typing import Dict, Any, List

def compute_weighted_scores(input_type: str, analysis: Dict[str, Any], trusted_sources: List[Dict[str, Any]], forensics: Dict[str, Any]) -> Dict[str, Any]:
    has_forensics = forensics and forensics.get("imageAnalysisStatus") == "Success"
    count = len(trusted_sources)
    avg_source_trust = (sum(s["reliability"] for s in trusted_sources) / count) if count > 0 else 40

    cred_score = analysis.get("credibilityScore", 50)
    conf_score = analysis.get("confidenceScore", 70)
    risk_score = 30

    if input_type == 'image' and has_forensics:
        deepfake_prob = forensics.get("deepfakeProbability", 50)
        img_authenticity = forensics.get("authenticityScore", 100 - deepfake_prob)
        img_risk = forensics.get("riskScore", deepfake_prob)

        w_img = 0.65 if count == 0 else 0.45
        w_text = 0.35 if count == 0 else 0.25
        w_sources = 0.0 if count == 0 else 0.30

        cred_score = int((img_authenticity * w_img) + (analysis.get("credibilityScore", 50) * w_text) + (avg_source_trust * w_sources))
        risk_score = int((img_risk * w_img) + ((100 - cred_score) * 0.4))
        conf_score = int((forensics.get("confidence", 80) * 0.5) + (analysis.get("confidenceScore", 70) * 0.5))

    else:
        if count > 0:
            cred_score = int((cred_score * 0.5) + (avg_source_trust * 0.5))
        risk_score = max(5, 100 - cred_score)

    cred_score = max(2, min(98, cred_score))
    conf_score = max(10, min(99, conf_score))
    risk_score = max(2, min(98, risk_score))

    risk_level = "High" if risk_score >= 65 else ("Medium" if risk_score >= 35 else "Low")
    
    rec = "Share with Caution"
    if cred_score >= 75 and risk_score < 35:
        rec = "Safe to Share"
    elif cred_score < 45 or risk_score >= 65:
        rec = "Do Not Share"

    return {
        "credibilityScore": cred_score,
        "confidenceScore": conf_score,
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "recommendation": rec
    }

def build_report(
    request_id: str,
    start_time: float,
    claim: str,
    input_type: str,
    content: str,
    analysis: Dict[str, Any],
    trusted_sources: List[Dict[str, Any]],
    forensics: Dict[str, Any] = None,
    url_metrics: Dict[str, Any] = None
) -> Dict[str, Any]:
    execution_time_ms = int((time.time() - start_time) * 1000)
    weighted = compute_weighted_scores(input_type, analysis, trusted_sources, forensics)

    return {
        "requestId": request_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "executionTimeMs": execution_time_ms,
        "input": content,
        "inputType": input_type,
        "claim": claim,
        "title": f"Verification Report: {claim[:60]}{'...' if len(claim) > 60 else ''}",
        "recommendation": weighted["recommendation"],
        "credibilityScore": weighted["credibilityScore"],
        "confidenceScore": weighted["confidenceScore"],
        "riskScore": weighted["riskScore"],
        "riskLevel": weighted["riskLevel"],
        "domain": analysis.get("domain", "General Information"),
        "isHighImpact": analysis.get("isHighImpact", False),
        "explanation": analysis.get("explanation", ""),
        "evidenceSummary": analysis.get("evidenceSummary", ""),
        "evidenceFor": analysis.get("evidenceFor", None),
        "evidenceAgainst": analysis.get("evidenceAgainst", None),
        "recommendationRationale": analysis.get("recommendationRationale", ""),
        "sourceQualityAssessment": analysis.get("sourceQualityAssessment", ""),
        "claims": analysis.get("claims", []),
        "sources": trusted_sources,
        "forensics": forensics,
        "urlMetrics": url_metrics
    }
