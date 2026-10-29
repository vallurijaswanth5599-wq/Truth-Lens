"""
Claim Extraction & Query Expansion Service
"""
import re
from typing import List, Dict, Any, Tuple

DOMAIN_PATTERNS = [
    (re.compile(r'vaccine|immuniz|injection|jab|pfizer|moderna', re.I), 'Health / Vaccines'),
    (re.compile(r'cancer|tumor|oncol|chemo|treatment|cure|drug|fda', re.I), 'Health / Medical'),
    (re.compile(r'covid|coronavirus|pandemic|sars|mpox|ebola|virus', re.I), 'Public Health'),
    (re.compile(r'election|vote|ballot|congress|senate|parliament', re.I), 'Politics / Elections'),
    (re.compile(r'bitcoin|crypto|nft|blockchain|defi|ethereum', re.I), 'Cryptocurrency'),
    (re.compile(r'climate|global warming|co2|carbon|fossil fuel', re.I), 'Climate / Environment'),
    (re.compile(r'ai model|chatgpt|gpt|llm|deepfake|machine learning', re.I), 'AI / Technology'),
    (re.compile(r'war|military|army|nato|troops|missile|nuclear', re.I), 'Conflict / National Security'),
    (re.compile(r'economy|recession|inflation|gdp|federal reserve', re.I), 'Economics / Finance'),
    (re.compile(r'https?://|\.com|\.org|phishing|scam|malware', re.I), 'Cybersecurity / URL Audit'),
]

HIGH_IMPACT_KEYWORDS = [
    'health', 'medical', 'vaccine', 'cancer', 'drug', 'treatment', 'disease',
    'covid', 'virus', 'election', 'vote', 'legal', 'law', 'finance', 'bank',
    'fraud', 'scam', 'nuclear', 'war', 'military'
]

def normalize_text(text: str) -> str:
    text = re.sub(r'[""'']', '"', text)
    return re.sub(r'\s+', ' ', text).strip()

def extract_claims(content: str, input_type: str, file_meta: Dict[str, Any] = None, visual_ctx: Dict[str, Any] = None) -> Tuple[str, List[str], str, bool]:
    raw = normalize_text(content or "")
    claim = raw
    domain = "General Information"
    queries = []

    if input_type == 'url' or raw.startswith(('http://', 'https://')):
        url = raw
        hostname = url
        try:
            from urllib.parse import urlparse
            hostname = urlparse(url).netloc.replace('www.', '')
        except Exception:
            pass
        claim = f"Is the website {hostname} legitimate, safe, and trustworthy?"
        queries = [
            f"{hostname} site review scam or legitimate",
            f"{hostname} phishing malware cybersecurity report",
            f"fact check {hostname} trustworthy website",
            f'"{hostname}" reviews complaints fraud 2025 2026'
        ]
        domain = "Cybersecurity / URL Audit"

    elif input_type in ('image', 'video', 'audio'):
        file_name = file_meta.get('name', '') if file_meta else ''
        if visual_ctx and visual_ctx.get('visual_description'):
            claim = visual_ctx['visual_description']
            if visual_ctx.get('search_keywords'):
                queries.extend(visual_ctx['search_keywords'])
            queries.append(f'"{claim[:70]}" fact check real or fake')
        else:
            claim = raw if not raw.startswith('[Uploaded') else f"Is this {input_type} authentic or AI-generated?"

        queries.extend([
            f"deepfake {input_type} detection how to identify",
            f"AI-generated {input_type} detection 2025 2026",
            f"{input_type} forensic analysis manipulation detection"
        ])
        domain = "Image Forensics" if input_type == 'image' else "Media Analysis"

    else:
        claim = raw
        queries.append(raw[:120])
        queries.append(f'fact check: "{raw[:80]}"')
        queries.append(f'"{raw[:60]}" debunked false misleading')

        matched_domain = None
        for pattern, dom in DOMAIN_PATTERNS:
            if pattern.search(raw):
                matched_domain = dom
                break
        
        if matched_domain:
            domain = matched_domain
            queries.append(f"{domain.split('/')[0].strip().lower()} latest research evidence {raw[:50]} 2025 2026")
        else:
            queries.append(f"{raw[:60]} latest news evidence 2025 2026")

    is_high_impact = any(k in claim.lower() for k in HIGH_IMPACT_KEYWORDS)
    unique_queries = list(dict.fromkeys(queries))[:5]
    return claim, uniqueQueries, domain, is_high_impact
