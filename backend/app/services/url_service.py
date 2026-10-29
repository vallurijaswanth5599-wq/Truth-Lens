"""
URL Reputation & Phishing Audit Engine
"""
import re
from urllib.parse import urlparse
from typing import Dict, Any

SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.online', '.site', '.work', '.click', '.loan', '.gq', '.cf', '.tk']
PHISHING_KEYWORDS = ['login', 'signin', 'verify', 'account', 'banking', 'secure', 'update', 'wallet', 'crypto', 'free', 'claim']

def audit_url_reputation(url_str: str) -> Dict[str, Any]:
    url_lower = url_str.lower()
    parsed = urlparse(url_str)
    domain = parsed.netloc.replace('www.', '')

    is_https = parsed.scheme == 'https'
    has_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    has_phishing_kw = any(kw in url_lower for kw in PHISHING_KEYWORDS)
    ip_pattern = re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain)

    risk_score = 15
    flags = []

    if not is_https:
        risk_score += 25
        flags.append("Insecure HTTP protocol (missing SSL Certificate)")

    if has_suspicious_tld:
        risk_score += 35
        flags.append(f"High-risk top-level domain ({domain.split('.')[-1]})")

    if has_phishing_kw:
        risk_score += 20
        flags.append("Phishing credential-harvesting keyword in URL structure")

    if ip_pattern:
        risk_score += 40
        flags.append("Direct IP address URL used instead of registered domain name")

    risk_score = min(98, max(5, risk_score))
    reputation_status = "Safe / Reputable" if risk_score < 35 else ("Suspicious" if risk_score < 65 else "High Risk / Phishing Warning")

    return {
        "url": url_str,
        "domain": domain or "unknown",
        "isHttps": is_https,
        "riskScore": risk_score,
        "reputationStatus": reputation_status,
        "flags": flags,
        "recommendation": "Safe to Visit" if risk_score < 35 else "Do Not Visit / Phishing Risk"
    }
