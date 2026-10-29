/**
 * MutAgent Verification Orchestration Engine
 * Coordinates modular MutAgent agents in a multi-stage verification pipeline:
 * 1. ClaimExtractionAgent: Decomposes user input into sub-claims via Gemini
 * 2. SearchPlanningAgent: Formulates multi-query search plan (including contradiction queries)
 * 3. TavilySearchExecutionAgent: Runs parallel web queries across Tavily + Search Fallbacks
 * 4. SourceQualityAgent: Ranks sources into Tiers 1-4 with domain trust scoring
 * 5. ContradictionSearchAgent: Scans for explicit refutation signals
 * 6. GeminiEvidenceAnalysisAgent: Performs CoT evidence-grounded claim reasoning
 * 7. DynamicScoringAgent: Computes distinct Truth, Confidence, and Risk metrics
 * 8. ReportBuilderAgent: Assembles structured JSON payload for streaming/API return
 */

import { extractClaims } from './claimExtractor.js';
import { executeTavilySearch } from './tavilySearch.js';
import { scoreAndFilterSources, computeSourceAgreement } from './sourceTrust.js';
import { analyzeWithGemini } from './geminiAnalysis.js';
import { buildReport } from './reportBuilder.js';

export async function runMutAgentVerificationPipeline(inputParams, onStageProgress = null) {
  const { requestId, startTime, content, inputType, fileMetadata, fileData } = inputParams;

  const notify = (stage, stepName, details) => {
    if (typeof onStageProgress === 'function') {
      onStageProgress({ stage, stepName, details, timestamp: new Date().toISOString() });
    }
  };

  // ── Agent 1: Claim Extraction & Sub-claim Decomposition ─────────────────────
  notify(0, 'ClaimExtractionAgent', 'Decomposing input into verifiable sub-claims via Gemini...');
  const extractionResult = await extractClaims(content, inputType, fileMetadata);
  const { claim, claims: extractedSubClaims, queries, domain, isHighImpact, searchPlan } = extractionResult;

  // ── Agent 2: Search Planning Agent ──────────────────────────────────────────
  notify(1, 'SearchPlanningAgent', `Generated ${queries.length} search queries (including contradiction probes).`);

  // ── Agent 3: Tavily Search Execution Agent ─────────────────────────────────
  notify(2, 'TavilySearchExecutionAgent', 'Executing multi-query Tavily search across web sources...');
  const tavilyResult = await executeTavilySearch(queries, claim);
  const { results: rawResults, tavilyAnswer } = tavilyResult;

  // ── Agent 4 & 5: Source Quality & Contradiction Analysis Agents ─────────────
  notify(3, 'SourceQualityAgent', `Evaluating ${rawResults.length} raw results across Tiers 1-4...`);
  const trustedSources = scoreAndFilterSources(rawResults, { minTrustScore: 35, maxSources: 15 }, claim);
  const sourceAgreement = computeSourceAgreement(trustedSources, claim);

  notify(4, 'ContradictionSearchAgent', `Source agreement computed: ${sourceAgreement.supporting} supporting, ${sourceAgreement.contradicting} contradicting.`);

  // ── Agent 6 & 7: Gemini Evidence Analysis & Claim Verification ──────────────
  notify(5, 'GeminiEvidenceAnalysisAgent', 'Performing evidence-grounded claim analysis via Gemini...');
  const analysis = await analyzeWithGemini(claim, trustedSources, inputType, domain, {
    tavilyAnswer,
    sourceAgreement,
    fileData,
    fileMetadata,
    claimsList: extractedSubClaims
  });

  // ── Agent 8 & 9: Dynamic Scoring & Report Assembly Agents ───────────────────
  notify(6, 'ReportBuilderAgent', 'Assembling final evidence-grounded dynamic verification report...');
  const report = buildReport({
    requestId,
    startTime,
    claim,
    inputType,
    content,
    analysis,
    trustedSources,
    queries,
    sourceAgreement,
    tavilyAnswer,
    fileMetadata,
    fileData
  });

  return { report, searchPlan, extractionResult };
}
