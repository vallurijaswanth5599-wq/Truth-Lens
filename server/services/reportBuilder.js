import { analyzeMediaForensics } from './mediaForensics.js';

/**
 * Report Builder Service
 * Assembles the final structured report from Gemini analysis + search sources.
 * The output shape matches exactly what ReportView.jsx expects.
 *
 * v2: Cross-validation layer, evidence quality grading, source agreement ratio,
 *     unverified claim flagging, recency indicators, accurate media forensics.
 */

/**
 * Compute evidence quality grade (A–F) based on source metrics.
 *
 * @param {object[]} sources - Filtered sources
 * @param {object} sourceAgreement - { supporting, contradicting, neutral, agreementRatio }
 * @returns {{ grade: string, label: string, reasoning: string }}
 */
function gradeEvidenceQuality(sources, sourceAgreement) {
  let score = 0;

  // Factor 1: Source count (0–30 points)
  if (sources.length >= 10) score += 30;
  else if (sources.length >= 7) score += 25;
  else if (sources.length >= 5) score += 20;
  else if (sources.length >= 3) score += 15;
  else if (sources.length >= 1) score += 5;

  // Factor 2: Trust tier distribution (0–35 points)
  const highTrust = sources.filter(s => s.reliability >= 80).length;
  const medTrust  = sources.filter(s => s.reliability >= 60 && s.reliability < 80).length;
  if (highTrust >= 5) score += 35;
  else if (highTrust >= 3) score += 28;
  else if (highTrust >= 1) score += 18;
  else if (medTrust >= 3) score += 12;
  else score += 5;

  // Factor 3: Recency (0–20 points) — how recent is the most recent source?
  const now = new Date();
  const recentSources = sources.filter(s => {
    if (!s.publishedDate) return false;
    const daysDiff = (now - new Date(s.publishedDate)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 90;
  });
  if (recentSources.length >= 3) score += 20;
  else if (recentSources.length >= 1) score += 12;
  else score += 3; // No recent sources

  // Factor 4: Source agreement (0–15 points)
  if (sourceAgreement) {
    if (sourceAgreement.agreementRatio >= 80) score += 15;
    else if (sourceAgreement.agreementRatio >= 60) score += 10;
    else if (sourceAgreement.agreementRatio >= 40) score += 5;
    else score += 0; // Heavily contradicted
  }

  // Convert score to grade
  let grade, label;
  if (score >= 85)      { grade = 'A'; label = 'Excellent — strong, consistent, recent evidence'; }
  else if (score >= 70) { grade = 'B'; label = 'Good — solid evidence with minor gaps'; }
  else if (score >= 55) { grade = 'C'; label = 'Fair — moderate evidence, some concerns'; }
  else if (score >= 35) { grade = 'D'; label = 'Weak — limited or conflicting evidence'; }
  else                  { grade = 'F'; label = 'Insufficient — evidence base is inadequate'; }

  return { grade, label, score };
}

/**
 * Cross-validate Gemini's claims against actual source snippets.
 * Flags claims that have no matching source content.
 *
 * @param {object[]} claims - Gemini's extracted claims
 * @param {object[]} sources - Filtered sources with snippets
 * @returns {{ validatedClaims: object[], unverifiedCount: number }}
 */
function crossValidateClaims(claims, sources) {
  const allSnippets = sources.map(s => (s.snippet || '').toLowerCase()).join(' ');
  let unverifiedCount = 0;

  const validatedClaims = claims.map(claim => {
    // Check if any keywords from the claim text appear in the source snippets
    const claimWords = claim.text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4); // Only check meaningful words

    const matchingWords = claimWords.filter(w => allSnippets.includes(w));
    const matchRatio = claimWords.length > 0 ? matchingWords.length / claimWords.length : 0;

    const isGrounded = matchRatio >= 0.3; // At least 30% of key words found in sources

    if (!isGrounded && claim.verified) {
      unverifiedCount++;
    }

    return {
      ...claim,
      groundedInSources: isGrounded,
      groundingConfidence: Math.round(matchRatio * 100),
    };
  });

  return { validatedClaims, unverifiedCount };
}

/**
 * Find the most recent source date from the sources list.
 */
function getMostRecentSourceDate(sources) {
  let mostRecent = null;
  for (const s of sources) {
    if (s.publishedDate) {
      const d = new Date(s.publishedDate);
      if (!mostRecent || d > mostRecent) mostRecent = d;
    }
  }
  return mostRecent ? mostRecent.toISOString().split('T')[0] : null;
}

/**
 * Build the complete verification report.
 *
 * @param {object} params
 * @param {string}   params.requestId        - Unique request ID
 * @param {number}   params.startTime        - pipeline start timestamp (ms)
 * @param {string}   params.claim            - Core verifiable claim
 * @param {string}   params.inputType        - text | url | image | audio | video | document
 * @param {string}   params.content          - Raw user input
 * @param {object}   params.analysis         - Gemini structured analysis
 * @param {object[]} params.trustedSources   - Scored & filtered sources
 * @param {string[]} params.queries          - Search queries used
 * @param {string}   params.presetId         - Optional preset ID
 * @param {object}   params.sourceAgreement  - Pre-computed agreement stats
 * @param {string}   params.tavilyAnswer     - Tavily AI answer (if available)
 * @returns {object} Complete report
 */
/**
 * Dynamic Multi-Factor Weighted Scoring Algorithm.
 * Combines Image Forensics, Gemini Analysis, Source Trust, Evidence Agreement, and Metadata.
 */
function computeWeightedScores({ inputType, analysis, trustedSources, forensics, sourceAgreement }) {
  const hasForensics = forensics && forensics.imageAnalysisStatus === 'Success' && forensics.deepfakeProbability !== null;
  const count = trustedSources ? trustedSources.length : 0;
  const avgSourceTrust = count > 0 ? (trustedSources.reduce((a, s) => a + s.reliability, 0) / count) : 40;

  // Credibility score comes directly from evidence-grounded claim evaluation
  let credScore = analysis?.credibilityScore ?? 50;

  // Verification Confidence score represents system certainty in the verdict.
  // High confidence exists for both TRUE (e.g. 95%) and FALSE (e.g. 95%) verdicts.
  let confScore = analysis?.confidenceScore ?? 70;
  if (count > 0) {
    const highTierBonus = trustedSources.filter(s => s.sourceTier <= 2).length * 4;
    confScore = Math.min(99, Math.round((confScore * 0.6) + (avgSourceTrust * 0.25) + highTierBonus));
  }

  // Risk Score: Potential harm of sharing (0-100), inverse of credibility + domain risk
  let riskScore = Math.max(3, Math.min(97, 100 - credScore));

  if (inputType === 'image' && hasForensics) {
    const deepfakeProb = forensics.deepfakeProbability;
    const imgAuthenticity = forensics.authenticityScore ?? (100 - deepfakeProb);
    const imgRisk = forensics.riskScore ?? deepfakeProb;
    const imgConfidence = forensics.confidence ?? 85;

    // For images, if deepfake/manipulation detected, reduce credibility proportionally
    if (deepfakeProb > 40) {
      credScore = Math.min(credScore, Math.round(100 - deepfakeProb));
    } else {
      credScore = Math.round((credScore * 0.6) + (imgAuthenticity * 0.4));
    }

    riskScore = Math.max(riskScore, Math.round(imgRisk));
    confScore = Math.round((confScore * 0.5) + (imgConfidence * 0.5));
  } else if (inputType === 'url') {
    // For URL audit: if domain is known suspicious/phishing, lower credibility
    if (analysis?.urlMetrics?.riskScore) {
      riskScore = Math.max(riskScore, analysis.urlMetrics.riskScore);
    }
  }

  credScore = Math.max(0, Math.min(100, credScore));
  confScore = Math.max(10, Math.min(99, confScore));
  riskScore = Math.max(0, Math.min(100, riskScore));

  let recommendation = analysis?.recommendation || 'Share with Caution';
  
  if (analysis?.recommendation === 'Unverified' || count === 0) {
    recommendation = 'Unverified';
    credScore = analysis?.credibilityScore ?? 0;
    confScore = analysis?.confidenceScore ?? 0;
    riskScore = analysis?.riskScore ?? 50;
  } else if (credScore >= 75 && riskScore < 35) {
    recommendation = 'Safe to Share';
  } else if (credScore >= 60 && riskScore < 45) {
    recommendation = 'Safe to Share';
  } else if (credScore < 45 || riskScore >= 60) {
    recommendation = 'Do Not Share';
  } else {
    recommendation = 'Share with Caution';
  }

  const riskLevel = riskScore >= 65 ? 'High' : riskScore >= 35 ? 'Medium' : 'Low';

  return { credibilityScore: credScore, confidenceScore: confScore, riskScore, riskLevel, recommendation };
}

/**
 * Build the final structured verification report.
 */
export function buildReport({
  requestId,
  startTime,
  claim,
  inputType,
  content,
  analysis,
  trustedSources,
  queries,
  presetId,
  sourceAgreement = null,
  tavilyAnswer = null,
  fileMetadata = null,
  fileData = null,
  forensics: passedForensics = null,
}) {
  const executionTimeMs = Date.now() - startTime;

  // Map sources to the shape ReportView expects
  const sources = trustedSources.map(s => ({
    name:           s.name,
    url:            s.url,
    domain:         s.domain,
    reliability:    s.reliability,
    type:           s.type,
    snippet:        s.snippet,
    publishedDate:  s.publishedDate || null,
    relevanceScore: s.relevanceScore || null,
  }));

  // Cross-validate Gemini's claims against source snippets
  const { validatedClaims, unverifiedCount } = crossValidateClaims(
    analysis.claims || [], trustedSources
  );

  // Compute evidence quality grade
  const evidenceQuality = gradeEvidenceQuality(trustedSources, sourceAgreement);

  // Build expert review packet
  const uncertaintyFlags = [];
  if (analysis.conflictsDetected)  uncertaintyFlags.push('Conflicting primary sources detected');
  if (analysis.confidenceScore < 60) uncertaintyFlags.push('Low evidence confidence — limited corroboration');
  if (trustedSources.length < 3)   uncertaintyFlags.push('Fewer than 3 trusted sources retrieved');
  if (analysis.recommendation === 'Insufficient Evidence') {
    uncertaintyFlags.push('No reliable evidence found — manual review required');
  }
  if (unverifiedCount > 0) {
    uncertaintyFlags.push(`${unverifiedCount} claim(s) could not be grounded in source snippets`);
  }
  if (evidenceQuality.grade === 'D' || evidenceQuality.grade === 'F') {
    uncertaintyFlags.push(`Evidence quality grade: ${evidenceQuality.grade} — ${evidenceQuality.label}`);
  }

  const expertReviewPacket = {
    submissionId:            requestId,
    claimsExtracted:         validatedClaims.length,
    claimsGroundedInSources: validatedClaims.filter(c => c.groundedInSources).length,
    claimsUngrounded:        unverifiedCount,
    authoritativeSourcesCited: sources.length,
    searchQueriesUsed:       queries,
    uncertaintyDisclosed:    uncertaintyFlags,
    provenanceChain:         'TruthLens RAV Pipeline v2 — Search + Source Trust + Gemini CoT Reasoning + Cross-Validation',
    conflictsDetected:       analysis.conflictsDetected || false,
    conflictSummary:         analysis.conflictSummary   || null,
  };

  // Determine forensics (for media/document types)
  let forensics = passedForensics;
  if (!forensics && ['image', 'video', 'audio', 'document'].includes(inputType)) {
    forensics = analyzeMediaForensics(inputType, fileMetadata, content, claim, analysis, fileData);
  }

  // Compute Dynamic Multi-Factor Weighted Scores
  const weighted = computeWeightedScores({
    inputType,
    analysis,
    trustedSources,
    forensics,
    sourceAgreement,
  });

  return {
    requestId,
    timestamp:     new Date().toISOString(),
    executionTimeMs,
    input:         content,
    inputType,
    title:         `Verification Report: ${claim.slice(0, 60)}${claim.length > 60 ? '…' : ''}`,

    // ── Core Verdict ──────────────────────────────────────────────────────
    verdict:          analysis.verdict || (weighted.recommendation === 'Unverified' ? 'UNVERIFIED' : 'PARTIALLY TRUE'),
    recommendation:   weighted.recommendation,
    credibilityScore: weighted.credibilityScore,
    confidenceScore:  weighted.confidenceScore,
    riskScore:        weighted.riskScore,
    riskLevel:        weighted.riskLevel,
    domain:           analysis.domain,
    isHighImpact:     analysis.isHighImpact,

    // ── Evidence ──────────────────────────────────────────────────────────
    claims:           validatedClaims,
    sources,

    // ── Evidence Quality Metrics (new in v2) ──────────────────────────────
    evidenceQuality,
    sourceAgreement:  sourceAgreement || null,
    mostRecentSource: getMostRecentSourceDate(trustedSources),

    // ── Explanation ───────────────────────────────────────────────────────
    explanation:          analysis.explanation,
    evidenceSummary:      analysis.evidenceSummary,
    evidenceFor:          analysis.evidenceFor || null,
    evidenceAgainst:      analysis.evidenceAgainst || null,
    sourceQualityAssessment: analysis.sourceQualityAssessment || null,
    recommendationRationale: analysis.recommendationRationale || null,
    conflictsDetected:    analysis.conflictsDetected || false,
    conflictSummary:      analysis.conflictSummary   || null,

    // ── Cross-Reference ──────────────────────────────────────────────────
    tavilyAnswer:  tavilyAnswer || null,

    // ── Media ─────────────────────────────────────────────────────────────
    forensics,

    // ── Expert Packet ────────────────────────────────────────────────────
    expertReviewPacket,
    scenario: presetId ? `benchmark-${presetId}` : 'live-rav-pipeline-v2',
  };
}
