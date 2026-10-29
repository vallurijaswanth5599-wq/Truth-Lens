"""
Gemini Multimodal Evidence Reasoning Engine
"""
import json
import base64
from typing import Dict, Any, List
import google.generativeai as genai
from app.core.config import settings

SYSTEM_PROMPT = """You are VeriTrust, an evidence-first fact verification AI built for a RAG verification pipeline.

ABSOLUTE RULES:
1. Base your verdict EXCLUSIVELY on retrieved evidence provided.
2. If evidence is insufficient, return recommendation: "Insufficient Evidence".
3. Cite sources by domain and number e.g. [Source 1: reuters.com].
4. Return valid JSON matching requested keys.

CHAIN-OF-THOUGHT PROTOCOL:
- Evaluate evidence FOR and AGAINST the claim.
- Rate source reliability.
- Compute credibilityScore (0-100), confidenceScore (0-100), riskLevel (Low/Medium/High).
- Select recommendation: "Safe to Share", "Share with Caution", "Do Not Share", "Requires Expert Review", "Insufficient Evidence"."""

async def extract_visual_context(file_data: str, file_meta: Dict[str, Any] = None) -> Dict[str, Any]:
    if not settings.GEMINI_API_KEY or "YOUR_KEY" in settings.GEMINI_API_KEY or not file_data:
        return {"visual_description": "", "ocr_text": "", "search_keywords": []}

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        clean_b64 = file_data.split(',')[1] if ',' in file_data else file_data
        image_bytes = base64.b64decode(clean_b64)
        mime_type = (file_meta.get("type") if file_meta else "image/jpeg") or "image/jpeg"

        prompt = """Inspect this image for web fact-checking verification. Return JSON with:
"visual_description": 1 sentence describing subjects/action.
"ocr_text": Visible text or headlines.
"search_keywords": 3-5 search keywords to query the web."""

        response = await model.generate_content_async([
            prompt,
            {"mime_type": mime_type if "image" in mime_type else "image/jpeg", "data": image_bytes}
        ])
        
        text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        return {
            "visual_description": parsed.get("visual_description", ""),
            "ocr_text": parsed.get("ocr_text", ""),
            "search_keywords": parsed.get("search_keywords", [])
        }
    except Exception as e:
        print(f"[Gemini Vision Pre-pass] Exception: {e}")
        return {"visual_description": "", "ocr_text": "", "search_keywords": []}

async def analyze_with_gemini(
    claim: str, 
    trusted_sources: List[Dict[str, Any]], 
    input_type: str, 
    domain: str, 
    extras: Dict[str, Any] = None
) -> Dict[str, Any]:
    extras = extras or {}
    tavily_answer = extras.get("tavily_answer", "")
    file_data = extras.get("file_data", None)

    if not settings.GEMINI_API_KEY or "YOUR_KEY" in settings.GEMINI_API_KEY:
        # Heuristic fallback if key is missing
        return generate_heuristic_fallback(claim, trusted_sources, input_type, domain)

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )

        evidence_str = "\n".join([
            f"[Source {i+1}] {s['name']} ({s['url']}) - Trust: {s['reliability']}/100\n  Snippet: {s['snippet'][:500]}"
            for i, s in enumerate(trusted_sources)
        ]) if trusted_sources else "(no retrieved sources)"

        user_prompt = f"""CLAIM TO VERIFY: "{claim}"
INPUT TYPE: {input_type}
DOMAIN: {domain}
TAVILY SEARCH SYNTHESIS: {tavily_answer or 'N/A'}

RETRIEVED EVIDENCE:
{evidence_str}

Return JSON with fields: recommendation, credibilityScore, confidenceScore, riskLevel, domain, explanation, evidenceSummary, evidenceFor, evidenceAgainst, recommendationRationale, conflictsDetected, isHighImpact, sourceQualityAssessment, claims (array of {{text, verified, source, sourceUrl}})."""

        contents = [user_prompt]
        if file_data and (input_type == 'image' or file_data.startswith('data:image')):
            clean_b64 = file_data.split(',')[1] if ',' in file_data else file_data
            image_bytes = base64.b64decode(clean_b64)
            contents.append({"mime_type": "image/jpeg", "data": image_bytes})

        response = await model.generate_content_async(contents)
        text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        return parsed

    except Exception as e:
        print(f"[Gemini Service] Call failed: {e}")
        return generate_heuristic_fallback(claim, trusted_sources, input_type, domain)

def generate_heuristic_fallback(claim: str, trusted_sources: List[Dict[str, Any]], input_type: str, domain: str) -> Dict[str, Any]:
    count = len(trusted_sources)
    if count == 0:
        return {
            "recommendation": "Insufficient Evidence",
            "credibilityScore": 30,
            "confidenceScore": 20,
            "riskLevel": "Medium",
            "domain": domain,
            "explanation": f"No live internet evidence found for claim '{claim}'.",
            "evidenceSummary": "Zero authoritative web sources retrieved.",
            "evidenceFor": "None",
            "evidenceAgainst": "None",
            "recommendationRationale": "Unverified claim without primary corroboration.",
            "conflictsDetected": False,
            "conflictSummary": None,
            "isHighImpact": False,
            "sourceQualityAssessment": "No sources retrieved",
            "claims": [{"text": claim, "verified": False}]
        }

    avg_trust = sum(s["reliability"] for s in trusted_sources) // count
    rec = "Safe to Share" if avg_trust >= 75 and count >= 2 else "Share with Caution"
    cred = max(10, min(95, avg_trust))

    return {
        "recommendation": rec,
        "credibilityScore": cred,
        "confidenceScore": min(90, 40 + count * 10),
        "riskLevel": "Low" if cred >= 70 else "Medium",
        "domain": domain,
        "explanation": f"Evaluated {count} web sources with average domain trust of {avg_trust}/100.",
        "evidenceSummary": f"Top source: {trusted_sources[0]['domain']}.",
        "evidenceFor": trusted_sources[0]['snippet'][:250],
        "evidenceAgainst": "None explicitly flagged.",
        "recommendationRationale": f"Based on {count} retrieved web sources.",
        "conflictsDetected": False,
        "conflictSummary": None,
        "isHighImpact": False,
        "sourceQualityAssessment": f"Retrieved {count} sources.",
        "claims": [{"text": claim, "verified": cred >= 70, "source": trusted_sources[0]["name"], "sourceUrl": trusted_sources[0]["url"]}]
    }
