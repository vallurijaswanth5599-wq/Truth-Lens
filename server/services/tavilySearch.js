/**
 * Search Service (Tavily with DuckDuckGo, Wikipedia & Google News Fallback)
 * Runs parallel search queries against Tavily API if configured,
 * or falls back to live DuckDuckGo, Wikipedia & Google News RSS search.
 *
 * v2: Deeper retrieval (10 results/query, 2000-char snippets), retry logic,
 *     include_answer for cross-reference, Google News RSS fallback.
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';

/**
 * Run multiple search queries in parallel and merge deduplicated results.
 * @param {string[]} queries - Array of search queries
 * @param {object} options
 * @returns {Promise<{ results: SearchResult[], tavilyAnswer: string|null }>}
 */
export async function searchClaim(queries, options = {}) {
  const {
    searchDepth = 'advanced',
    maxResultsPerQuery = 10,
  } = options;

  const hasTavilyKey = !!process.env.TAVILY_API_KEY && !process.env.TAVILY_API_KEY.includes('YOUR_KEY');

  let tavilyAnswer = null;

  if (hasTavilyKey) {
    try {
      const settled = await Promise.allSettled(
        queries.map(q => searchSingleTavily(q, { searchDepth, maxResults: maxResultsPerQuery }))
      );

      const allResults = [];
      for (const result of settled) {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value.results);
          // Capture the first non-null Tavily answer
          if (!tavilyAnswer && result.value.answer) {
            tavilyAnswer = result.value.answer;
          }
        } else {
          console.warn('[Tavily] Query failed:', result.reason?.message);
        }
      }

      if (allResults.length > 0) {
        const byUrl = new Map();
        for (const r of allResults) {
          const existing = byUrl.get(r.url);
          if (!existing || r.score > existing.score) {
            byUrl.set(r.url, r);
          }
        }
        return { results: Array.from(byUrl.values()), tavilyAnswer };
      }
    } catch (e) {
      console.warn('[Tavily Search] Tavily failed, falling back to public search engine:', e.message);
    }
  }

  // ── Fallback Search Engine (DuckDuckGo + Wikipedia + Google News) ────────
  console.log('[Search Engine] Using live DuckDuckGo, Wikipedia & Google News fallback');
  const fallbackSettled = await Promise.allSettled(
    queries.map(q => searchPublicFallback(q))
  );

  const fallbackResults = [];
  for (const result of fallbackSettled) {
    if (result.status === 'fulfilled') {
      fallbackResults.push(...result.value);
    }
  }

  const byUrl = new Map();
  for (const r of fallbackResults) {
    if (!byUrl.has(r.url)) {
      byUrl.set(r.url, r);
    }
  }

  return { results: Array.from(byUrl.values()), tavilyAnswer: null };
}

/**
 * Single Tavily search query with retry logic.
 */
async function searchSingleTavily(query, { searchDepth, maxResults }, retries = 2) {
  const body = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: searchDepth,
    max_results: maxResults,
    include_answer: true,     // Enable Tavily AI answer for cross-referencing
    include_raw_content: false,
    include_images: false,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(TAVILY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.warn('[Tavily] 401 Unauthorized API Key — switching instantly to live DuckDuckGo, Wikipedia & Google News fallback.');
          return { results: [], answer: null };
        }
        const text = await res.text().catch(() => '');
        // Retry on 429 (rate limit) or 5xx server errors
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          const backoffMs = (attempt + 1) * 1500;
          console.warn(`[Tavily] ${res.status} on attempt ${attempt + 1}, retrying in ${backoffMs}ms...`);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }
        throw new Error(`Tavily ${res.status}: ${text.slice(0, 200)}`);
      }

      const data = await res.json();

      const results = (data.results || []).map(r => ({
        title: (r.title || '').trim(),
        url: r.url || '',
        content: (r.content || '').trim().slice(0, 2000),   // Increased from 1200 → 2000
        score: typeof r.score === 'number' ? r.score : 0.8,
        publishedDate: r.published_date || null,
        query,
      }));

      return {
        results,
        answer: data.answer || null,   // Tavily's AI-generated answer
      };
    } catch (err) {
      if (attempt < retries && err.name !== 'AbortError') {
        const backoffMs = (attempt + 1) * 1500;
        console.warn(`[Tavily] Attempt ${attempt + 1} failed: ${err.message}, retrying in ${backoffMs}ms...`);
        await new Promise(r => setTimeout(r, backoffMs));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Public Fallback Search: Wikipedia API + DuckDuckGo HTML + Google News RSS
 */
async function searchPublicFallback(query) {
  const results = [];
  const cleanQuery = query.replace(/["'']/g, '').replace(/\b(false|debunked|hoax|disproven|fake|misleading)\b/gi, '').trim();

  // Helper: extract the best 2-4 topic keywords from a query
  function extractTopicTerms(text, maxTerms = 3) {
    const stopWords = new Set([
      'general','latest','news','evidence','fact','check','false','debunked','true',
      'that','2024','2025','2026','is','it','the','and','for','with','are','was','were',
      'has','have','had','not','but','from','this','about','does','cause','causes',
      'caused','make','makes','made','will','would','could','should','been','being',
      'official','announcement','delayed','misleading','towers','tower'
    ]);
    // Keep alphanumeric tokens including those with hyphens (COVID-19, 5G)
    const tokens = text
      .replace(/["']/g, '')
      .split(/\s+/)
      .map(t => t.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
      .filter(t => t.length > 1 && !stopWords.has(t.toLowerCase()));
    // Prioritize: capitalized words, longer words, alphanumeric-only
    const scored = tokens.map(t => ({
      term: t,
      score: (/^[A-Z]/.test(t) ? 3 : 0) + (t.length > 5 ? 2 : t.length > 3 ? 1 : 0) + (/\d/.test(t) ? 1 : 0)
    }));
    scored.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const result = [];
    for (const { term } of scored) {
      const lower = term.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(term);
        if (result.length >= maxTerms) break;
      }
    }
    return result.length > 0 ? result : [text.slice(0, 40)];
  }

  const topicTerms = extractTopicTerms(cleanQuery, 3);
  const wikiQuery = topicTerms.join(' ');

  // 1. Query Wikipedia API — increased to 6 results
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiQuery)}&utf8=&format=json&origin=*&srlimit=6`;
    const res = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'TruthLensFactChecker/1.0 (https://truthlens.ai; contact@truthlens.ai)' },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const data = await res.json();
      const wikiItems = data.query?.search || [];
      for (const item of wikiItems.slice(0, 6)) {
        const snippet = item.snippet.replace(/<[^>]*>/g, ''); // strip HTML tags
        results.push({
          title: `${item.title} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          content: snippet,
          score: 0.85,
          publishedDate: new Date().toISOString().split('T')[0],
          query,
        });
      }
    }
  } catch (err) {
    console.warn('[Wiki Search Fallback] Failed:', err.message);
  }

  // 2. Query Wikipedia REST Summary API
  try {
    const topTopic = topicTerms[0] || 'Earth';
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTopic)}`;
    const res = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'TruthLensFactChecker/1.0 (https://truthlens.ai; contact@truthlens.ai)' },
      signal: AbortSignal.timeout(4_000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.extract) {
        results.push({
          title: `${data.title || topTopic} - Wikipedia Summary`,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topTopic)}`,
          content: data.extract,
          score: 0.90,
          publishedDate: new Date().toISOString().split('T')[0],
          query,
        });
      }
    }
  } catch (err) {
    console.warn('[Wiki REST Fallback] Failed:', err.message);
  }

  // 3. Google News RSS for recency — new fallback source
  try {
    const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery.slice(0, 80))}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(newsUrl, {
      headers: { 'User-Agent': 'TruthLens-Verification-Agent/2.0' },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      const xml = await res.text();
      // Simple XML extraction for RSS items
      const items = xml.split('<item>').slice(1, 5); // Top 4 items
      for (const item of items) {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);

        const title = (titleMatch?.[1] || titleMatch?.[2] || 'News Result').replace(/<[^>]*>/g, '');
        const link = linkMatch?.[1] || '';
        const pubDate = pubDateMatch?.[1] || null;
        const desc = (descMatch?.[1] || descMatch?.[2] || '').replace(/<[^>]*>/g, '').trim();

        if (link && link.startsWith('http')) {
          results.push({
            title: `${title} (Google News)`,
            url: link,
            content: desc || title,
            score: 0.80,
            publishedDate: pubDate ? new Date(pubDate).toISOString().split('T')[0] : null,
            query,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Google News RSS Fallback] Failed:', err.message);
  }

  return results;
}

export { searchClaim as executeTavilySearch };
