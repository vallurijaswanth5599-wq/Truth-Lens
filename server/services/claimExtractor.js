/**
 * Claim Extractor & Search Planning Service
 * Decomposes multi-sentence user input into verifiable factual claims via Gemini,
 * extracts key entities, dates, and locations, and generates multi-query search plans
 * including explicit contradiction queries to avoid confirmation bias.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const HIGH_IMPACT_KEYWORDS = [
  'health', 'medical', 'vaccine', 'cancer', 'drug', 'treatment', 'cure', 'disease',
  'pandemic', 'covid', 'virus', 'election', 'vote', 'legal', 'law', 'court', 'tax',
  'finance', 'bank', 'crash', 'invest', 'fraud', 'scam', 'climate', 'nuclear',
  'war', 'military', 'terrorist', 'attack', 'explosion', 'death', 'casualty'
];

const DOMAIN_PATTERNS = [
  { pattern: /vaccine|immuniz|injection|jab|pfizer|moderna|astrazeneca/i, domain: 'Health / Vaccines' },
  { pattern: /cancer|tumor|oncol|chemo|treatment|cure|drug|fda approv/i, domain: 'Health / Medical' },
  { pattern: /covid|coronavirus|pandemic|sars|mpox|ebola|virus|flu/i, domain: 'Public Health' },
  { pattern: /election|vote|ballot|congress|senate|parliament|democrat|republican/i, domain: 'Politics / Elections' },
  { pattern: /bitcoin|crypto|nft|blockchain|defi|eth |ethereum/i, domain: 'Cryptocurrency' },
  { pattern: /climate|global warming|co2|carbon|emission|fossil fuel/i, domain: 'Climate / Environment' },
  { pattern: /artificial intelligence|ai model|chatgpt|gpt|llm|deepfake|machine learning/i, domain: 'AI / Technology' },
  { pattern: /war|military|army|nato|troops|missile|nuclear|bomb|explosion/i, domain: 'Conflict / National Security' },
  { pattern: /economy|recession|inflation|gdp|unemployment|federal reserve/i, domain: 'Economics / Finance' },
  { pattern: /https?:\/\/|\.com|\.org|\.net|phishing|scam|malware/i, domain: 'Cybersecurity / URL Audit' },
  { pattern: /\.(pdf|docx?|txt)|document|report|leaked|leak/i, domain: 'Official Documents' }
];

/**
 * Clean text whitespace and smart quotes.
 */
function normalizeText(text) {
  return (text || '')
    .replace(/[""'']/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fallback claim decomposer using regex sentence parsing.
 */
function fallbackClaimExtraction(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  const claimsList = (sentences.length > 0 ? sentences : [text]).map((sentence, idx) => {
    const words = sentence.split(/\s+/);
    const shortText = sentence.length > 80 ? sentence.slice(0, 80) : sentence;

    return {
      id: `claim_${idx + 1}`,
      text: sentence,
      entities: words.filter(w => /^[A-Z][a-z0-9]+/.test(w)).slice(0, 4),
      date: sentence.match(/\b(19|20)\d{2}\b/)?.[0] || null,
      location: null,
      searchQueries: [
        sentence,
        `"${shortText}" fact check`,
        `"${shortText}" official announcement`,
        `is it true that ${shortText}`,
        `"${shortText}" false debunked misleading delayed`
      ]
    };
  });

  return claimsList;
}

/**
 * Perform structured claim extraction via Gemini.
 */
async function extractClaimsWithGemini(text) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_KEY')) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

    const prompt = `Analyze the following text input and break it down into independently verifiable factual sub-claims.
For each sub-claim:
1. Extract exact factual statement text.
2. Identify key entities (people, organizations, products, places).
3. Identify relevant date or year if present.
4. Generate 5 targeted search queries:
   - Query 1: Exact claim search
   - Query 2: Entity + event search
   - Query 3: Official source / announcement search
   - Query 4: Reputable news coverage search
   - Query 5: EXPLICIT CONTRADICTION SEARCH (e.g. search for terms like "false", "debunked", "did not happen", "hoax", "misleading")

User Input: "${text}"

Return JSON matching this schema ONLY:
{
  "originalText": "${text}",
  "claims": [
    {
      "id": "claim_1",
      "text": "...",
      "entities": ["..."],
      "date": "...",
      "location": "...",
      "searchQueries": ["query 1", "query 2", "query 3", "query 4", "query 5"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(responseText);

    if (parsed && Array.isArray(parsed.claims) && parsed.claims.length > 0) {
      return parsed.claims;
    }
  } catch (err) {
    console.warn('[Claim Extraction] Gemini structured extraction failed, using fallback:', err.message);
  }

  return null;
}

/**
 * Main export: Extract claims and build search plan.
 *
 * @param {string} content
 * @param {string} inputType
 * @param {object} fileMeta
 * @param {object} visualContext
 * @returns {Promise<{ claim: string, claims: object[], queries: string[], domain: string, isHighImpact: boolean, searchPlan: object }>}
 */
export async function extractClaims(content, inputType, fileMeta = null, visualContext = null) {
  const raw = normalizeText(content);
  let mainClaim = raw;
  let domain = 'General Information';

  // Handle media/URL/document input types
  if (inputType === 'url' || raw.startsWith('http://') || raw.startsWith('https://')) {
    let hostname = raw;
    try { hostname = new URL(raw).hostname.replace('www.', ''); } catch {}
    mainClaim = `Is the website ${hostname} legitimate, safe, and trustworthy?`;
    domain = 'Cybersecurity / URL Audit';
  } else if (inputType === 'image' || inputType === 'video' || inputType === 'audio') {
    if (visualContext?.visualDescription) {
      mainClaim = raw.startsWith('[Uploaded') ? visualContext.visualDescription : `${raw} (${visualContext.visualDescription})`;
    } else {
      mainClaim = raw.startsWith('[Uploaded') ? `Is this ${inputType} media authentic or AI-generated?` : raw;
    }
    domain = inputType === 'image' ? 'Image Forensics' : inputType === 'video' ? 'Video / Deepfake Analysis' : 'Audio / Voice Cloning';
  } else if (inputType === 'document') {
    const fileName = fileMeta?.name || '';
    mainClaim = fileName ? `Is the document "${fileName}" authentic and from a verified source?` : raw;
    domain = 'Official Documents';
  }

  // Attempt Gemini structured claim extraction
  let extractedClaims = null;
  if (inputType === 'text' && raw.length > 15) {
    extractedClaims = await extractClaimsWithGemini(raw);
  }

  // Fall back to regex parsing if Gemini extraction unfulfilled
  if (!extractedClaims || extractedClaims.length === 0) {
    extractedClaims = fallbackClaimExtraction(mainClaim);
  }

  // Collect all search queries across claims including contradiction queries
  const allQueries = [];
  extractedClaims.forEach(c => {
    if (Array.isArray(c.searchQueries)) {
      c.searchQueries.forEach(q => allQueries.push(q));
    } else {
      allQueries.push(c.text);
    }
  });

  // Ensure unique queries (max 10 for multi-query depth)
  const uniqueQueries = [...new Set(allQueries)].slice(0, 10);

  // Infer domain if default
  if (domain === 'General Information') {
    for (const { pattern, domain: d } of DOMAIN_PATTERNS) {
      if (pattern.test(raw)) {
        domain = d;
        break;
      }
    }
  }

  const isHighImpact = HIGH_IMPACT_KEYWORDS.some(k => raw.toLowerCase().includes(k));

  return {
    claim: mainClaim,
    claims: extractedClaims,
    queries: uniqueQueries,
    domain,
    isHighImpact,
    searchPlan: {
      totalClaims: extractedClaims.length,
      queriesCount: uniqueQueries.length,
      hasContradictionQueries: uniqueQueries.some(q => /false|debunked|hoax|disproven|fake/i.test(q))
    }
  };
}
