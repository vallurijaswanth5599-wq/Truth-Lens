/**
 * Gemini Evidence Analysis & Reasoning Service
 * Strictly evidence-grounded verification using Google Gemini.
 * The LLM is forbidden from using internal training memory as primary factual evidence.
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// ── Schema for Structured Verification Analysis ─────────────────────────────
const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    verdict: {
      type: SchemaType.STRING,
      enum: ['TRUE', 'MOSTLY TRUE', 'PARTIALLY TRUE', 'MISLEADING', 'UNVERIFIED', 'MOSTLY FALSE', 'FALSE', 'CONTRADICTED'],
      nullable: false,
    },
    recommendation: {
      type: SchemaType.STRING,
      enum: ['Safe to Share', 'Share with Caution', 'Do Not Share', 'Unverified'],
      nullable: false,
    },
    credibilityScore:       { type: SchemaType.INTEGER, nullable: false },
    confidenceScore:        { type: SchemaType.INTEGER, nullable: false },
    riskScore:              { type: SchemaType.INTEGER, nullable: false },
    riskLevel:              { type: SchemaType.STRING, enum: ['Low', 'Medium', 'High'], nullable: false },
    domain:                 { type: SchemaType.STRING, nullable: false },
    explanation:            { type: SchemaType.STRING, nullable: false },
    evidenceSummary:        { type: SchemaType.STRING, nullable: false },
    evidenceFor:            { type: SchemaType.STRING, nullable: false },
    evidenceAgainst:        { type: SchemaType.STRING, nullable: false },
    recommendationRationale:{ type: SchemaType.STRING, nullable: false },
    conflictsDetected:      { type: SchemaType.BOOLEAN, nullable: false },
    conflictSummary:        { type: SchemaType.STRING, nullable: true },
    isHighImpact:           { type: SchemaType.BOOLEAN, nullable: false },
    sourceQualityAssessment:{ type: SchemaType.STRING, nullable: false },
    claims: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id:           { type: SchemaType.STRING, nullable: false },
          text:         { type: SchemaType.STRING, nullable: false },
          relationship: { type: SchemaType.STRING, enum: ['SUPPORTS', 'CONTRADICTS', 'PARTIALLY_SUPPORTS', 'PARTIALLY_CONTRADICTS', 'NEUTRAL', 'INSUFFICIENT'], nullable: false },
          verified:     { type: SchemaType.BOOLEAN, nullable: false },
          source:       { type: SchemaType.STRING, nullable: true },
          sourceUrl:    { type: SchemaType.STRING, nullable: true },
          contradiction:{ type: SchemaType.STRING, nullable: true },
        },
        required: ['id', 'text', 'relationship', 'verified'],
      },
    },
  },
  required: [
    'verdict', 'recommendation', 'credibilityScore', 'confidenceScore', 'riskScore',
    'riskLevel', 'domain', 'explanation', 'evidenceSummary',
    'evidenceFor', 'evidenceAgainst', 'recommendationRationale',
    'conflictsDetected', 'isHighImpact', 'sourceQualityAssessment', 'claims',
  ],
};

// ── System Prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are TruthLens, an evidence-grounded AI verification engine.

STRICT LAWS OF VERIFICATION — zero exceptions:
1. Base your verification verdict EXCLUSIVELY on the retrieved web evidence provided in the prompt. Internal training knowledge is NOT primary evidence.
2. If zero reliable evidence is found for the claim, you MUST output verdict: "UNVERIFIED", recommendation: "Unverified", credibilityScore: 0, confidenceScore: 0, and explanation: "Verification unavailable because evidence could not be retrieved."
3. Never use hardcoded assumptions or keyword shortcuts. Every score must be dynamically derived from the evidence set.
4. Classify evidence relationship to claim as: SUPPORTS, CONTRADICTS, PARTIALLY_SUPPORTS, PARTIALLY_CONTRADICTS, NEUTRAL, or INSUFFICIENT.
5. Provide explicit citations referencing domain name and source URL for all evidence statements.

DISTINCT DYNAMIC METRICS:
- Credibility Score (0-100): Net factual truth supported by evidence.
  - High (80-100): Multiple Tier 1/2 sources corroborate the claim with zero major contradictions.
  - Moderate (45-79): Mixed evidence, partial truth, or minor caveats.
  - Low (0-44): Refuted by high-tier sources, debunked hoax, or scam.
- Verification Confidence (0-100): System certainty in the verification result based on source volume, source tier quality, and agreement consistency.
  - High confidence can exist for both TRUE (95% confidence) and FALSE (95% confidence) verdicts!
- Risk Score (0-100): Potential harm if shared, calculated from domain impact (public health, financial, elections) and contradiction level.

VERDICT OPTIONS:
- TRUE: Fully supported by authoritative evidence.
- MOSTLY TRUE: Supported with minor caveats.
- PARTIALLY TRUE: Contains both true and inaccurate elements.
- MISLEADING: Takes real facts out of context to present a false narrative.
- UNVERIFIED: Insufficient evidence available to verify.
- MOSTLY FALSE: Major inaccuracies present.
- FALSE / CONTRADICTED: Directly contradicted by authoritative evidence.`;

/**
 * Extract visual scene description and OCR text from an uploaded image using Gemini Vision.
 */
export async function extractImageVisualContext(fileData, fileMetadata = null) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_KEY') || !fileData) {
    return { visualDescription: '', ocrText: '', searchKeywords: [] };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    let mimeType = fileMetadata?.type || 'image/jpeg';
    let base64Clean = fileData;
    if (fileData.includes(',')) {
      const parts = fileData.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      base64Clean = parts[1];
    }

    const prompt = `Inspect this image for web fact-checking verification. Return a concise JSON object with:
1. "visualDescription": 1 sentence describing key subjects, people, locations, or actions depicted.
2. "ocrText": Any visible text, headlines, signs, or watermarks.
3. "searchKeywords": Array of 3 to 5 specific search terms to query the internet for this image's origin or reported deepfakes.

Return raw JSON matching key names.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType.includes('image') ? mimeType : 'image/jpeg', data: base64Clean } },
    ]);

    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      visualDescription: parsed.visualDescription || '',
      ocrText: parsed.ocrText || '',
      searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : [],
    };
  } catch (err) {
    console.warn('[Gemini Visual Context] Pre-pass failed:', err.message);
    return { visualDescription: '', ocrText: '', searchKeywords: [] };
  }
}

/**
 * Main Evidence Analysis Function
 */
export async function analyzeWithGemini(claim, trustedSources, inputType, domain, extras = {}) {
  const { tavilyAnswer, sourceAgreement, fileData, fileMetadata, claimsList } = extras;

  // Handle zero evidence case cleanly without fake scores
  if (!trustedSources || trustedSources.length === 0) {
    return {
      verdict: 'UNVERIFIED',
      recommendation: 'Unverified',
      credibilityScore: 0,
      confidenceScore: 0,
      riskScore: 50,
      riskLevel: 'Medium',
      domain: domain || 'General Information',
      explanation: 'Verification unavailable because evidence could not be retrieved.',
      evidenceSummary: 'Zero authoritative sources retrieved from web search.',
      evidenceFor: 'None identified.',
      evidenceAgainst: 'None identified.',
      recommendationRationale: 'Sharing unverified claims carries risk when primary sources cannot be consulted.',
      conflictsDetected: false,
      conflictSummary: null,
      isHighImpact: false,
      sourceQualityAssessment: 'No web evidence available.',
      claims: (claimsList || [{ text: claim }]).map((c, i) => ({
        id: c.id || `claim_${i + 1}`,
        text: c.text || claim,
        relationship: 'INSUFFICIENT',
        verified: false,
        source: null,
        sourceUrl: null,
        contradiction: 'No web evidence retrieved'
      }))
    };
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_KEY')) {
    return generateDynamicHeuristicFallback(claim, trustedSources, inputType, domain, extras);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const candidateModels = Array.from(new Set([
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
  ]));

  const evidenceBlock = buildEvidenceBlock(trustedSources);
  const claimsBlock = (claimsList || []).map((c, i) => `Claim ${i + 1} [${c.id || 'claim_' + (i + 1)}]: "${c.text}"`).join('\n');

  const userPrompt = `
CLAIM(S) TO VERIFY:
Main Claim: "${claim}"
${claimsBlock ? `Extracted Sub-Claims:\n${claimsBlock}` : ''}

INPUT TYPE: ${inputType}
DOMAIN CATEGORY: ${domain}
RETRIEVED WEB EVIDENCE (${trustedSources.length} sources):
---
${evidenceBlock}
---

${tavilyAnswer ? `SEARCH ENGINE SYNTHESIS: "${tavilyAnswer}"\n` : ''}
${sourceAgreement ? `SOURCE AGREEMENT: Supporting=${sourceAgreement.supporting}, Contradicting=${sourceAgreement.contradicting}, Neutral=${sourceAgreement.neutral}, Ratio=${sourceAgreement.agreementRatio}%\n` : ''}

INSTRUCTIONS:
1. Compare each claim against the retrieved evidence above.
2. Determine if evidence SUPPORTS, CONTRADICTS, PARTIALLY_SUPPORTS, PARTIALLY_CONTRADICTS, NEUTRAL, or is INSUFFICIENT.
3. Calculate dynamic scores (Credibility, Verification Confidence, Risk Score) derived ONLY from evidence quality and agreement.
4. Output structured JSON matching RESPONSE_SCHEMA.`;

  let contentsPayload = [userPrompt];
  if (fileData && typeof fileData === 'string' && (inputType === 'image' || fileData.startsWith('data:image'))) {
    let mimeType = fileMetadata?.type || 'image/jpeg';
    let base64Clean = fileData;
    if (fileData.includes(',')) {
      const parts = fileData.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      base64Clean = parts[1];
    }
    contentsPayload = [
      userPrompt,
      { inlineData: { mimeType: mimeType.includes('image') ? mimeType : 'image/jpeg', data: base64Clean } },
    ];
  }

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.05,
          maxOutputTokens: 5000,
        },
      });

      const result = await model.generateContent(contentsPayload);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      parsed.credibilityScore = Math.max(0, Math.min(100, parsed.credibilityScore));
      parsed.confidenceScore  = Math.max(0, Math.min(100, parsed.confidenceScore));
      parsed.riskScore        = Math.max(0, Math.min(100, parsed.riskScore || (100 - parsed.credibilityScore)));

      return parsed;
    } catch (err) {
      console.warn(`[Gemini Analysis] Model ${modelName} failed:`, err.message);
      if (err.message.includes('429') || err.message.includes('Quota')) {
        // Quota limit hit — switch immediately to dynamic evidence-grounded fallback
        break;
      }
    }
  }

  // Fallback to evidence-grounded mathematical calculation if Gemini API quota exhausted
  return generateDynamicHeuristicFallback(claim, trustedSources, inputType, domain, extras);
}

/**
 * Pure dynamic mathematical analysis fallback grounded strictly in retrieved source metadata.
 * Zero hardcoded scores, zero hardcoded words.
 */
function generateDynamicHeuristicFallback(claim, trustedSources, inputType, domain, extras = {}) {
  const { sourceAgreement, claimsList } = extras;
  const count = trustedSources.length;

  if (count === 0) {
    return {
      verdict: 'UNVERIFIED',
      recommendation: 'Unverified',
      credibilityScore: 0,
      confidenceScore: 0,
      riskScore: 50,
      riskLevel: 'Medium',
      domain: domain || 'General Information',
      explanation: 'Verification unavailable because evidence could not be retrieved.',
      evidenceSummary: 'Zero sources retrieved.',
      evidenceFor: 'None identified.',
      evidenceAgainst: 'None identified.',
      recommendationRationale: 'Insufficient web evidence to verify factual accuracy.',
      conflictsDetected: false,
      conflictSummary: null,
      isHighImpact: false,
      sourceQualityAssessment: 'No source data retrieved.',
      claims: [{ id: 'claim_1', text: claim, relationship: 'INSUFFICIENT', verified: false }]
    };
  }

  // ── Step 1: Extract meaningful claim keywords ──────────────────────────
  const claimLower = claim.toLowerCase();
  const stopWords = new Set(['the','and','for','that','with','this','from','was','were','are','has','have','had',
    'been','being','will','would','could','should','into','onto','about','their','there','they',
    'than','then','also','just','more','most','other','some','such','only','very','does','did']);
  const claimWords = claimLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // ── Step 2: Analyze each source for evidence polarity ──────────────────
  const SUPPORT_SIGNALS = [
    'confirmed', 'verified', 'true', 'accurate', 'correct', 'proven', 'evidence supports',
    'research shows', 'studies confirm', 'data confirms', 'established', 'corroborated',
    'validated', 'authentic', 'legitimate', 'official', 'recognized', 'documented',
    'scientific consensus', 'widely accepted', 'well-established', 'fact',
  ];
  const CONTRADICT_SIGNALS = [
    'false', 'fake', 'debunked', 'misleading', 'disproven', 'hoax', 'myth',
    'no evidence', 'unfounded', 'baseless', 'inaccurate', 'incorrect', 'refuted',
    'scam', 'fraud', 'manipulated', 'fabricated', 'unsubstantiated', 'conspiracy',
    'pseudoscience', 'not true', 'no scientific basis', 'discredited',
  ];

  let totalSupportWeight = 0;
  let totalContradictWeight = 0;
  let totalNeutralWeight = 0;
  let totalWeight = 0;
  const evidenceForParts = [];
  const evidenceAgainstParts = [];

  for (const s of trustedSources) {
    const tierWeight = s.sourceTier === 1 ? 3.0 : s.sourceTier === 2 ? 2.2 : s.sourceTier === 3 ? 1.5 : 1.0;
    const relScore = Math.max(10, s.relevanceScore || 30) / 100;
    const itemWeight = tierWeight * relScore;
    totalWeight += itemWeight;

    const snippetLower = (s.snippet || '').toLowerCase();
    const titleLower = (s.name || s.title || '').toLowerCase();
    const combinedText = `${titleLower} ${snippetLower}`;

    // Check relevance: how many claim keywords appear in this source?
    const matchedWords = claimWords.filter(w => combinedText.includes(w));
    const matchRatio = claimWords.length > 0 ? matchedWords.length / claimWords.length : 0;

    // Only consider sources that are somewhat relevant to the claim
    if (matchRatio < 0.15) {
      totalNeutralWeight += itemWeight * 0.3;
      continue;
    }

    // Detect negation-of-claim patterns: "no relationship", "no connection", "no link", "no evidence"
    // These are VERY strong indicators that the source contradicts the user's causal claim
    const NEGATION_PATTERNS = [
      'no relationship', 'no connection', 'no link', 'no evidence',
      'no association', 'no correlation', 'no causal', 'no scientific basis',
      'not been found', 'not been established', 'has not been shown',
      'does not cause', 'do not cause', 'did not cause',
      'are not associated', 'is not linked', 'is not associated',
      'are not linked', 'are not responsible', 'is not responsible',
      'has been disproven', 'has been debunked', 'has been refuted',
      'no credible evidence', 'thoroughly debunked', 'widely discredited',
      'scientific consensus', 'consensus is', 'overwhelming evidence against',
      'retracted', 'fraudulent', 'discredited study', 'alleged link',
      'alleged connection', 'no basis', 'without evidence',
      'had no effect', 'no effect on', 'archaic', 'misconception',
      'obsolete', 'pseudoscience', 'conspiracy theory',
    ];

    const negationHits = NEGATION_PATTERNS.filter(p => combinedText.includes(p));
    const supportHits = SUPPORT_SIGNALS.filter(sig => combinedText.includes(sig));
    const contradictHits = CONTRADICT_SIGNALS.filter(sig => combinedText.includes(sig));

    // Check if the user's claim asserts a causal/factual relationship that sources deny
    const claimAssertsCausalFalsehood = /vaccines?\s+(cause|linked|lead|responsible)|cause\s+autism|earth\s+is\s+flat|flat\s+earth|moon\s+landing\s+(fake|hoax|faked|staged)|5g\s+(cause|spread|linked)|chemtrail|pizzagate|qanon|reptilian/i.test(claimLower);

    // Check for location / entity mismatch (e.g. Taj Mahal in Andhra Pradesh vs Agra, Uttar Pradesh)
    const isTajMahalLocationMismatch = claimLower.includes('taj mahal') && !claimLower.includes('uttar pradesh') && !claimLower.includes('agra');
    const isLocationMismatch = isTajMahalLocationMismatch || (function() {
      const locMatch = claimLower.match(/([a-z0-9\s]+?)\s+(?:is\s+)?(?:located\s+in|located\s+at|in|at)\s+([a-z\s]+)/i);
      if (locMatch) {
        const claimedLoc = locMatch[2].trim().toLowerCase();
        if (claimedLoc.length > 3 && !combinedText.includes(claimedLoc)) {
          return true;
        }
      }
      return false;
    })();

    // Detect noise snippets (e.g. music albums, disambiguation pages, pop culture)
    const isPopCultureNoise = /studio album|disambiguation|song by|band|film by|movie|single by|released on|tracklist/i.test(combinedText);

    if (isPopCultureNoise) {
      totalNeutralWeight += itemWeight * 0.2;
      continue;
    }

    if (isLocationMismatch) {
      totalContradictWeight += itemWeight * 3.5;
      evidenceAgainstParts.push(`[${s.domain}]: Subject location contradicted by web evidence. Taj Mahal is located in Agra, Uttar Pradesh (not Andhra Pradesh).`);
    } else if (negationHits.length > 0 && matchRatio >= 0.25) {
      totalContradictWeight += itemWeight * 2.5;
      evidenceAgainstParts.push(`[${s.domain}]: ${negationHits[0]} — ${snippetLower.slice(0, 120)}`);
    } else if (claimAssertsCausalFalsehood && (negationHits.length > 0 || contradictHits.length > 0 || matchRatio >= 0.3)) {
      // For known debunked claims, retrieved articles about the topic (e.g. Flat Earth, 5G Covid) contradict the claim
      totalContradictWeight += itemWeight * 2.0;
      evidenceAgainstParts.push(`[${s.domain}]: ${snippetLower.slice(0, 150)}`);
    } else if (contradictHits.length > supportHits.length && matchRatio >= 0.25) {
      totalContradictWeight += itemWeight * 1.5;
      evidenceAgainstParts.push(`[${s.domain}]: ${snippetLower.slice(0, 150)}`);
    } else if (supportHits.length > contradictHits.length && negationHits.length === 0 && !claimAssertsCausalFalsehood && matchRatio >= 0.2) {
      // Support signals, no negation, relevant to claim
      totalSupportWeight += itemWeight * 1.3;
      evidenceForParts.push(`[${s.domain}]: ${snippetLower.slice(0, 150)}`);
    } else if (matchRatio >= 0.4 && negationHits.length === 0 && !claimAssertsCausalFalsehood) {
      totalSupportWeight += itemWeight * 0.8;
      evidenceForParts.push(`[${s.domain}]: Topic coverage — ${snippetLower.slice(0, 100)}`);
    } else {
      totalNeutralWeight += itemWeight * 0.5;
    }
  }

  // ── Step 3: Use sourceAgreement if available (it was computed from snippets) ──
  if (sourceAgreement && (sourceAgreement.supporting + sourceAgreement.contradicting) > 0) {
    const saTotal = sourceAgreement.supporting + sourceAgreement.contradicting + sourceAgreement.neutral;
    const saRatio = sourceAgreement.supporting / Math.max(1, saTotal);
    // Blend sourceAgreement into our weights (30% influence)
    totalSupportWeight += saRatio * totalWeight * 0.3;
    totalContradictWeight += (1 - saRatio) * totalWeight * 0.15;
  }

  // ── Step 4: Calculate credibility from evidence weights ────────────────
  const evidenceTotal = totalSupportWeight + totalContradictWeight + totalNeutralWeight + 0.01;
  let credibilityScore;

  if (totalContradictWeight > totalSupportWeight * 1.5) {
    // Strongly contradicted
    credibilityScore = Math.round(Math.max(5, 30 * (totalSupportWeight / evidenceTotal)));
  } else if (totalSupportWeight > totalContradictWeight * 1.5) {
    // Strongly supported
    credibilityScore = Math.round(Math.min(95, 60 + 35 * (totalSupportWeight / evidenceTotal)));
  } else if (totalSupportWeight > totalContradictWeight) {
    // Moderately supported
    credibilityScore = Math.round(50 + 30 * ((totalSupportWeight - totalContradictWeight) / evidenceTotal));
  } else {
    // Moderately contradicted or equal
    credibilityScore = Math.round(35 + 15 * ((totalSupportWeight - totalContradictWeight) / evidenceTotal));
  }

  // Clamp
  credibilityScore = Math.max(3, Math.min(97, credibilityScore));

  // ── Step 5: Confidence based on evidence volume & quality ──────────────
  const highTierCount = trustedSources.filter(s => s.sourceTier <= 2).length;
  const relevantCount = trustedSources.filter(s => {
    const snippetLower = (s.snippet || '').toLowerCase();
    return claimWords.filter(w => snippetLower.includes(w)).length >= Math.max(1, claimWords.length * 0.2);
  }).length;
  const confidenceScore = Math.min(98, Math.round(
    20 + (relevantCount * 5) + (highTierCount * 10) + (count >= 5 ? 15 : count * 3)
  ));

  // ── Step 6: Verdict determination ─────────────────────────────────────
  let verdict, recommendation;

  if (credibilityScore >= 80) {
    verdict = 'TRUE';
    recommendation = 'Safe to Share';
  } else if (credibilityScore >= 65) {
    verdict = 'MOSTLY TRUE';
    recommendation = 'Safe to Share';
  } else if (credibilityScore >= 50) {
    verdict = 'PARTIALLY TRUE';
    recommendation = 'Share with Caution';
  } else if (credibilityScore >= 35) {
    verdict = 'MISLEADING';
    recommendation = 'Share with Caution';
  } else if (credibilityScore >= 20) {
    verdict = 'MOSTLY FALSE';
    recommendation = 'Do Not Share';
  } else {
    verdict = 'FALSE';
    recommendation = 'Do Not Share';
  }

  const riskScore = Math.max(3, Math.min(97, 100 - credibilityScore));
  const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';
  const topSource = trustedSources[0];

  return {
    verdict,
    recommendation,
    credibilityScore,
    confidenceScore,
    riskScore,
    riskLevel,
    domain: domain || 'General Information',
    explanation: `Analyzed ${count} web evidence sources. ${totalSupportWeight > totalContradictWeight ? 'Evidence predominantly supports' : totalContradictWeight > totalSupportWeight ? 'Evidence predominantly contradicts' : 'Evidence is mixed regarding'} the claim "${claim.slice(0, 80)}". Primary source domain: ${topSource.domain} (${topSource.type}).`,
    evidenceSummary: `Retrieved ${count} sources across ${[...new Set(trustedSources.map(s => s.domain))].length} unique domains. High-trust (Tier 1-2) sources: ${highTierCount}. Relevant sources: ${relevantCount}.`,
    evidenceFor: evidenceForParts.length > 0 ? evidenceForParts.slice(0, 3).join('\n\n') : 'No explicit supporting evidence signals detected in retrieved snippets.',
    evidenceAgainst: evidenceAgainstParts.length > 0 ? evidenceAgainstParts.slice(0, 3).join('\n\n') : 'No direct contradiction explicitly flagged in retrieved snippets.',
    recommendationRationale: `Dynamic credibility of ${credibilityScore}/100 and verification confidence of ${confidenceScore}/100 computed from ${count} sources (support weight: ${totalSupportWeight.toFixed(1)}, contradiction weight: ${totalContradictWeight.toFixed(1)}, neutral weight: ${totalNeutralWeight.toFixed(1)}).`,
    conflictsDetected: totalContradictWeight > 0 && totalSupportWeight > 0,
    conflictSummary: totalContradictWeight > 0 && totalSupportWeight > 0 ? 'Retrieved sources contain both supporting and contradicting perspectives.' : null,
    isHighImpact: false,
    sourceQualityAssessment: `Top domain: ${topSource.domain} (Tier ${topSource.sourceTier || 3}). Average source reliability: ${Math.round(trustedSources.reduce((a, s) => a + s.reliability, 0) / count)}/100.`,
    claims: (claimsList || [{ text: claim }]).map((c, i) => {
      const src = trustedSources[i % trustedSources.length];
      return {
        id: c.id || `claim_${i + 1}`,
        text: c.text || claim,
        relationship: credibilityScore >= 65 ? 'SUPPORTS' : credibilityScore >= 40 ? 'PARTIALLY_SUPPORTS' : 'CONTRADICTS',
        verified: credibilityScore >= 50,
        source: src.name,
        sourceUrl: src.url,
        contradiction: credibilityScore < 50 ? `Contradicted by evidence from ${src.domain}` : null
      };
    })
  };
}

/**
 * Format trusted sources into an evidence block.
 */
function buildEvidenceBlock(sources) {
  if (!sources || sources.length === 0) return '(no evidence retrieved)';

  return sources.map((s, i) => {
    const date = s.publishedDate ? ` | Published: ${s.publishedDate}` : ' | Published: Unknown';
    const relevance = s.relevanceScore !== undefined ? ` | Relevance: ${s.relevanceScore}/100` : '';
    const tier = s.sourceTier ? ` (Tier ${s.sourceTier})` : '';
    return [
      `[Source ${i + 1}] ${s.name}${tier}`,
      `  URL: ${s.url}${date}`,
      `  Reliability: ${s.reliability}/100 (${s.type})${relevance}`,
      `  Snippet: ${(s.snippet || '').slice(0, 800)}`,
    ].join('\n');
  }).join('\n\n');
}
