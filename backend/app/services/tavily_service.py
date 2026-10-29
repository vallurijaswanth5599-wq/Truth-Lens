"""
Tavily Deep Search & Public Search Fallback Engine
"""
import httpx
import asyncio
from typing import List, Dict, Any, Tuple
from app.core.config import settings

TAVILY_API_URL = "https://api.tavily.com/search"

async def search_single_tavily(client: httpx.AsyncClient, query: str) -> Tuple[List[Dict[str, Any]], str]:
    if not settings.TAVILY_API_KEY or "YOUR_KEY" in settings.TAVILY_API_KEY:
        return [], ""
    
    payload = {
        "api_key": settings.TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": 10,
        "include_answer": True
    }
    
    try:
        res = await client.post(TAVILY_API_URL, json=payload, timeout=12.0)
        if res.status_code == 200:
            data = res.json()
            answer = data.get("answer", "")
            results = []
            for r in data.get("results", []):
                results.append({
                    "title": r.get("title", "").strip(),
                    "url": r.get("url", ""),
                    "content": r.get("content", "").strip()[:2000],
                    "score": r.get("score", 0.8),
                    "publishedDate": r.get("published_date", None),
                    "query": query
                })
            return results, answer
    except Exception as e:
        print(f"[Tavily] Query failed for '{query}': {e}")
    return [], ""

async def search_wikipedia(client: httpx.AsyncClient, query: str) -> List[Dict[str, Any]]:
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&utf8=&format=json&srlimit=5"
        res = await client.get(url, headers={"User-Agent": "VeriTrust-Agent/2.0"}, timeout=6.0)
        if res.status_code == 200:
            items = res.json().get("query", {}).get("search", [])
            results = []
            for item in items:
                import re
                clean_snippet = re.sub(r'<[^>]*>', '', item.get("snippet", ""))
                title = item.get("title", "")
                results.append({
                    "title": f"{title} - Wikipedia",
                    "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
                    "content": clean_snippet,
                    "score": 0.85,
                    "publishedDate": None,
                    "query": query
                })
            return results
    except Exception:
        pass
    return []

async def search_claim(queries: List[str]) -> Tuple[List[Dict[str, Any]], str]:
    all_results = []
    tavily_answer = ""

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Try Tavily API if key configured
        if settings.TAVILY_API_KEY and "YOUR_KEY" not in settings.TAVILY_API_KEY:
            tasks = [search_single_tavily(client, q) for q in queries]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            for resp in responses:
                if isinstance(resp, tuple):
                    res_list, ans = resp
                    all_results.extend(res_list)
                    if ans and not tavily_answer:
                        tavily_answer = ans
        
        # Fallback to Wikipedia / Open Search if no results
        if not all_results:
            wiki_tasks = [search_wikipedia(client, q) for q in queries]
            wiki_responses = await asyncio.gather(*wiki_tasks, return_exceptions=True)
            for resp in wiki_responses:
                if isinstance(resp, list):
                    all_results.extend(resp)

    # Deduplicate by URL
    by_url = {}
    for r in all_results:
        url = r["url"]
        if url not in by_url or r["score"] > by_url[url]["score"]:
            by_url[url] = r

    return list(by_url.values()), tavily_answer
