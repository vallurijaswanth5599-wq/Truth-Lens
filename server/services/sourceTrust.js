/**
 * Source Trust Scoring Service
 * Assigns reliability scores (0–100) to domains based on curated trust tiers.
 * Lower-trust domains are filtered out before evidence is sent to the LLM.
 *
 * v2: Dynamic scoring with recency boosts, snippet relevance scoring,
 *     source-agreement pre-computation, expanded limits (15 sources, min trust 35).
 */

// ── Trust Database ──────────────────────────────────────────────────────────
const DOMAIN_TRUST = {
  // ── Tier 1: Official / Scientific (90–100) ──────────────────────────────
  'who.int': 99,
  'cdc.gov': 98,
  'nih.gov': 98,
  'fda.gov': 97,
  'nasa.gov': 97,
  'noaa.gov': 95,
  'epa.gov': 94,
  'whitehouse.gov': 92,
  'europa.eu': 92,
  'ec.europa.eu': 92,
  'un.org': 95,
  'unicef.org': 93,
  'worldbank.org': 91,
  'imf.org': 91,
  'nature.com': 97,
  'sciencemag.org': 97,
  'nejm.org': 97,
  'thelancet.com': 96,
  'bmj.com': 95,
  'pubmed.ncbi.nlm.nih.gov': 96,
  'ncbi.nlm.nih.gov': 95,
  'jamanetwork.com': 94,
  'cell.com': 93,
  'science.org': 96,
  'pnas.org': 94,
  'ieee.org': 92,
  'acm.org': 91,
  'arxiv.org': 84,

  // ── Tier 2: Major International News (80–92) ─────────────────────────────
  'reuters.com': 93,
  'apnews.com': 93,
  'bbc.com': 90,
  'bbc.co.uk': 90,
  'theguardian.com': 86,
  'nytimes.com': 85,
  'washingtonpost.com': 85,
  'bloomberg.com': 88,
  'economist.com': 89,
  'ft.com': 88,
  'npr.org': 87,
  'pbs.org': 86,
  'cbsnews.com': 82,
  'abcnews.go.com': 82,
  'nbcnews.com': 81,
  'wsj.com': 85,
  'time.com': 83,
  'newsweek.com': 76,
  'politico.com': 80,
  'thehill.com': 78,
  'axios.com': 82,
  'vox.com': 76,
  'theatlantic.com': 82,
  'foreignaffairs.com': 88,
  'foreignpolicy.com': 84,
  'dw.com': 83,
  'france24.com': 83,
  'aljazeera.com': 75,
  'scmp.com': 74,
  'straitstimes.com': 79,
  'theaustralian.com.au': 75,
  'smh.com.au': 78,
  'thehindu.com': 76,
  'timesofindia.com': 72,
  'haaretz.com': 76,
  'lemonde.fr': 84,
  'spiegel.de': 83,

  // ── Tier 3: Fact-Checkers (88–94) ────────────────────────────────────────
  'snopes.com': 92,
  'politifact.com': 91,
  'factcheck.org': 92,
  'fullfact.org': 91,
  'africa-check.org': 88,
  'factcheck.afp.com': 90,
  'chequeado.com': 85,
  'factnameh.com': 82,
  'boomlive.in': 80,
  'firstdraftnews.com': 84,

  // ── Tier 4: Tech / Business (70–85) ──────────────────────────────────────
  'techcrunch.com': 78,
  'wired.com': 82,
  'ars-technica.com': 82,
  'arstechnica.com': 82,
  'theverge.com': 79,
  'engadget.com': 75,
  'gizmodo.com': 72,
  'zdnet.com': 75,
  'cnet.com': 73,
  'pcmag.com': 74,
  'forbes.com': 75,
  'fortune.com': 76,
  'harvard.edu': 90,
  'mit.edu': 92,
  'stanford.edu': 91,
  'oxford.ac.uk': 92,
  'cambridge.org': 90,
  'wikipedia.org': 65,

  // ── Tier 5: Mixed / Moderate reliability (50–69) ─────────────────────────
  'rt.com': 35,          // State media — significant bias
  'sputniknews.com': 30,
  'tass.com': 45,
  'xinhua.net': 40,
  'globaltimes.cn': 32,
  'dailymail.co.uk': 52,
  'nypost.com': 55,
  'foxnews.com': 55,
  'msnbc.com': 58,
  'huffpost.com': 62,
  'businessinsider.com': 68,
  'vice.com': 64,

  // ── Blocked: Known misinformation sites (<20) ─────────────────────────────
  'infowars.com': 2,
  'naturalnews.com': 5,
  'beforeitsnews.com': 4,
  'thegatewaypundit.com': 8,
  'worldnewsdailyreport.com': 3,
  'empirenews.net': 2,
  'huzlers.com': 2,
  'newslo.com': 3,
  'nationalreport.net': 2,
  'abcnews.com.co': 1,      // Fake ABC News
  'cbsnews.com.co': 1,      // Fake CBS News
  'zerohedge.com': 32,
  'breitbart.com': 28,
  'oann.com': 35,
};

// TLD trust defaults (when domain not in DOMAIN_TRUST)
const TLD_TRUST_DEFAULTS = {
  '.gov': 88,
  '.edu': 82,
  '.org': 60,
  '.int': 85,
  '.mil': 78,
  '.ac.uk': 80,
  '.gov.uk': 87,
  '.gov.au': 86,
};

// Phrases that flag low-trust content
const LOW_TRUST_SIGNALS = [
  'conspiracy', 'truther', 'patriot', 'awakening',
  'deep-state', 'deep_state', 'globalist', 'plandemic',
  'scamdemic', '5g-danger', 'chemtrail',
];

/**
 * Extract the root domain from a URL
 */
function extractDomain(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Remove www. prefix
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Score a single domain (0–100)
 */
function scoreDomain(url) {
  const domain = extractDomain(url);

  // Direct lookup
  if (DOMAIN_TRUST[domain] !== undefined) {
    return DOMAIN_TRUST[domain];
  }

  // Partial match (e.g. subdomain.reuters.com)
  for (const [key, score] of Object.entries(DOMAIN_TRUST)) {
    if (domain.endsWith(`.${key}`) || domain === key) {
      return score;
    }
  }

  // TLD-based defaults
  for (const [tld, score] of Object.entries(TLD_TRUST_DEFAULTS)) {
    if (domain.endsWith(tld)) return score;
  }

  // Low-trust signal scan in domain name
  if (LOW_TRUST_SIGNALS.some(s => domain.includes(s))) return 12;

  // Unknown domain — neutral
  return 55;
}

/**
 * Compute Jaccard similarity between two texts (word-level).
 * Returns 0.0–1.0 representing how relevant the snippet is to the claim.
 */
function jaccardSimilarity(textA, textB) {
  const tokenize = (t) => new Set(
    t.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)  // Ignore very short words
  );
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

/**
 * Calculate recency boost/penalty based on published date.
 * @param {string|null} publishedDate - ISO date string or null
 * @returns {number} bonus between -5 and +8
 */
function recencyBonus(publishedDate) {
  if (!publishedDate) return 0;
  try {
    const pub = new Date(publishedDate);
    const now = new Date();
    const daysDiff = (now - pub) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7)  return 8;   // Published this week
    if (daysDiff <= 30) return 5;   // Published this month
    if (daysDiff <= 90) return 3;   // Published this quarter
    if (daysDiff <= 365) return 0;  // Published this year — neutral
    if (daysDiff <= 730) return -3; // 1-2 years old
    return -5;                       // Older than 2 years
  } catch {
    return 0;
  }
}

/**
 * Score and filter a list of raw search results.
 * Returns sources sorted by composite score (trust + relevance + recency),
 * filtered above the minimum threshold.
 *
 * @param {object[]} rawResults - Raw search results
 * @param {object} options
 * @param {string} claim - The original claim text for relevance scoring
 * @returns {object[]} Scored, filtered, and sorted sources
 */
export function scoreAndFilterSources(rawResults = [], options = {}, claim = '') {
  const safeResults = Array.isArray(rawResults) ? rawResults : [];
  const {
    minTrustScore = 35,   // Lowered from 45 → 35 to let Gemini see borderline sources
    maxSources = 15,      // Increased from 10 → 15 for broader evidence
  } = options;

  return safeResults
    .map(result => {
      const baseTrustScore = scoreDomain(result.url);
      const domain = extractDomain(result.url);

      // Apply recency bonus/penalty
      const recency = recencyBonus(result.publishedDate);
      const trustScore = Math.max(0, Math.min(100, baseTrustScore + recency));

      // Compute relevance to the claim
      const relevance = claim ? jaccardSimilarity(claim, result.content || '') : 0;

      // Determine trust tier label and tier number (1-4)
      let trustTier;
      let sourceTier;
      if (trustScore >= 88) {
        trustTier = 'Tier 1: Government / Official / Academic';
        sourceTier = 1;
      } else if (trustScore >= 75) {
        trustTier = 'Tier 2: Major News / Wire Service';
        sourceTier = 2;
      } else if (trustScore >= 55) {
        trustTier = 'Tier 3: Established Independent';
        sourceTier = 3;
      } else {
        trustTier = 'Tier 4: Blog / SEO / Unverified';
        sourceTier = 4;
      }

      return {
        name: result.title || domain,
        url: result.url,
        domain,
        reliability: trustScore,
        baseTrustScore,
        type: trustTier,
        sourceTier,
        snippet: result.content || '',
        publishedDate: result.publishedDate || null,
        searchScore: result.score || 0,
        relevanceScore: Math.round(relevance * 100),  // 0–100
        query: result.query || '',
      };
    })
    .filter(s => s.reliability >= minTrustScore)
    // Sort by composite: trust (40%) + search relevance (30%) + snippet relevance (30%)
    .sort((a, b) => {
      const scoreA = a.reliability * 0.4 + a.searchScore * 30 + a.relevanceScore * 0.3;
      const scoreB = b.reliability * 0.4 + b.searchScore * 30 + b.relevanceScore * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, maxSources);
}

/**
 * Pre-compute source agreement statistics.
 * Measures how many sources appear to support vs. contradict the claim.
 *
 * @param {object[]} sources - Filtered sources with snippets
 * @param {string} claim - The core claim
 * @returns {{ supporting: number, contradicting: number, neutral: number, agreementRatio: number }}
 */
export function computeSourceAgreement(sources, claim) {
  const SUPPORT_SIGNALS = [
    'confirmed', 'verified', 'true', 'correct', 'accurate', 'evidence supports',
    'research shows', 'studies confirm', 'data confirms', 'proven', 'established',
    'corroborated', 'validated', 'authentic', 'legitimate',
  ];
  const CONTRADICT_SIGNALS = [
    'false', 'fake', 'debunked', 'misleading', 'disproven', 'hoax', 'myth',
    'no evidence', 'unfounded', 'baseless', 'inaccurate', 'incorrect', 'refuted',
    'scam', 'fraud', 'manipulated', 'fabricated', 'unsubstantiated',
  ];

  let supporting = 0;
  let contradicting = 0;
  let neutral = 0;

  for (const source of sources) {
    const text = (source.snippet || '').toLowerCase();
    const claimWords = claim.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    // Check if snippet is actually relevant to the claim
    const mentionsClaim = claimWords.some(w => text.includes(w));
    if (!mentionsClaim) {
      neutral++;
      continue;
    }

    const hasSupport = SUPPORT_SIGNALS.some(s => text.includes(s));
    const hasContradict = CONTRADICT_SIGNALS.some(s => text.includes(s));

    if (hasSupport && !hasContradict) supporting++;
    else if (hasContradict && !hasSupport) contradicting++;
    else if (hasSupport && hasContradict) neutral++; // Mixed — count as neutral
    else neutral++;
  }

  const total = supporting + contradicting + neutral;
  const agreementRatio = total > 0
    ? Math.round((supporting / total) * 100)
    : 50; // Default to 50 when no data

  return { supporting, contradicting, neutral, agreementRatio };
}

export { extractDomain, scoreDomain };
