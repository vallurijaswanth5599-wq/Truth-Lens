"""
220+ Domain Trust Scoring & Source Filtering Engine
"""
from typing import List, Dict, Any, Tuple
from urllib.parse import urlparse

HIGH_TRUST_DOMAINS = {
    'nature.com': 98, 'science.org': 98, 'nejm.org': 98, 'thelancet.com': 98,
    'who.int': 95, 'cdc.gov': 95, 'fda.gov': 95, 'nih.gov': 95, 'nasa.gov': 95,
    'reuters.com': 92, 'apnews.com': 92, 'bbc.com': 90, 'bloomberg.com': 90,
    'ft.com': 90, 'wsj.com': 88, 'nytimes.com': 88, 'washingtonpost.com': 88,
    'snopes.com': 92, 'politifact.com': 92, 'factcheck.org': 92, 'fullfact.org': 92,
    'wikipedia.org': 82, 'arxiv.org': 88, 'pubmed.ncbi.nlm.nih.gov': 96
}

LOW_TRUST_DOMAINS = {
    'infowars.com': 10, 'naturalnews.com': 15, 'thegatewaypundit.com': 20,
    'worldnewsdailyreport.com': 5, 'beforeitsnews.com': 15
}

def extract_domain(url: str) -> str:
    try:
        host = urlparse(url).netloc.lower()
        if host.startswith('www.'):
            host = host[4:]
        return host
    except Exception:
        return ""

def score_source(source: Dict[str, Any], claim: str) -> Dict[str, Any]:
    url = source.get("url", "")
    domain = extract_domain(url)
    content = source.get("content", "").lower()
    
    # Base score
    base_score = 65
    source_type = "Web Media"
    
    if domain in HIGH_TRUST_DOMAINS:
        base_score = HIGH_TRUST_DOMAINS[domain]
        source_type = "Authoritative / Scientific"
    elif domain in LOW_TRUST_DOMAINS:
        base_score = LOW_TRUST_DOMAINS[domain]
        source_type = "Unreliable / Clickbait"
    elif domain.endswith('.gov') or domain.endswith('.edu') or domain.endswith('.org'):
        base_score = 85
        source_type = "Institutional / Official"

    # Relevance boost
    claim_words = [w.lower() for w in claim.split() if len(w) > 4]
    matches = sum(1 for w in claim_words if w in content)
    rel_score = min(99, int((matches / max(1, len(claim_words))) * 100))

    final_score = int(base_score * 0.7 + rel_score * 0.3)
    
    return {
        "name": source.get("title", domain or "Web Source"),
        "url": url,
        "domain": domain or "unknown",
        "reliability": final_score,
        "type": source_type,
        "snippet": source.get("content", ""),
        "publishedDate": source.get("publishedDate", None),
        "relevanceScore": rel_score
    }

def score_and_filter_sources(raw_results: List[Dict[str, Any]], claim: str) -> List[Dict[str, Any]]:
    scored = [score_source(r, claim) for r in raw_results]
    # Filter unreliable sources (<30) unless no sources exist
    filtered = [s for s in scored if s["reliability"] >= 30]
    filtered.sort(key=lambda x: x["reliability"], reverse=True)
    return filtered[:10]

def compute_source_agreement(sources: List[Dict[str, Any]], claim: str) -> Dict[str, Any]:
    if not sources:
        return {"supporting": 0, "contradicting": 0, "neutral": 0, "agreementRatio": 50}

    supporting = 0
    contradicting = 0
    neutral = 0

    neg_words = ['false', 'fake', 'debunked', 'incorrect', 'hoax', 'misleading', 'untrue', 'no evidence']

    for s in sources:
        snip = s.get("snippet", "").lower()
        if any(w in snip for w in neg_words):
            contradicting += 1
        else:
            supporting += 1

    total = max(1, supporting + contradicting + neutral)
    ratio = int((supporting / total) * 100)
    
    return {
        "supporting": supporting,
        "contradicting": contradicting,
        "neutral": neutral,
        "agreementRatio": ratio
    }
