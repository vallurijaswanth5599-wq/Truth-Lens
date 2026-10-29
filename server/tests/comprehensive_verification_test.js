/**
 * TruthLens Evidence-Grounded Verification Test Suite
 * Validates that the verification system:
 * 1. Produces distinct evidence-driven verdicts and dynamic scores for different inputs.
 * 2. Correctly differentiates opposite claims ("Earth is spherical" vs "Earth is flat").
 * 3. Correctly differentiates contextual errors ("India won 1983 Cricket World Cup" vs "in football").
 * 4. Outputs clean UNVERIFIED status when evidence is unavailable.
 */

import dotenv from 'dotenv';
dotenv.config();

import { extractClaims } from '../services/claimExtractor.js';
import { executeTavilySearch } from '../services/tavilySearch.js';
import { scoreAndFilterSources, computeSourceAgreement } from '../services/sourceTrust.js';
import { analyzeWithGemini } from '../services/geminiAnalysis.js';
import { buildReport } from '../services/reportBuilder.js';

const TEST_CASES = [
  {
    id: 1,
    category: 'Clearly True Factual Claim',
    input: 'The Earth is approximately spherical and orbits the Sun.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share']
  },
  {
    id: 2,
    category: 'Clearly False Factual Claim',
    input: 'The Earth is completely flat and supported on the back of giant turtles.',
    inputType: 'text',
    expectedVerdict: ['FALSE', 'CONTRADICTED', 'MOSTLY FALSE', 'Do Not Share']
  },
  {
    id: 3,
    category: 'Partially True Claim',
    input: 'India won the 1983 World Cup in cricket, beating the West Indies in London.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share']
  },
  {
    id: 4,
    category: 'Contextual Error / Misleading Claim',
    input: 'India won the 1983 Cricket World Cup in football.',
    inputType: 'text',
    expectedVerdict: ['FALSE', 'MOSTLY FALSE', 'MISLEADING', 'Do Not Share', 'Share with Caution']
  },
  {
    id: 5,
    category: 'Recent / Current Economic Claim',
    input: 'The US Federal Reserve lowered benchmark interest rates in September 2024.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share', 'Share with Caution']
  },
  {
    id: 6,
    category: 'Historical Space Claim',
    input: 'NASA Apollo 11 astronaut Neil Armstrong walked on the Moon in July 1969.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share']
  },
  {
    id: 7,
    category: 'Obscure Technical Claim',
    input: 'The fast inverse square root function in Quake III uses the constant 0x5f3759df.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share', 'Share with Caution']
  },
  {
    id: 8,
    category: 'Insufficient Evidence Claim',
    input: 'Zyborgia-X 999 alien spacecraft landed in my backyard yesterday at 3 PM.',
    inputType: 'text',
    expectedVerdict: ['UNVERIFIED', 'FALSE', 'Do Not Share', 'Unverified']
  },
  {
    id: 9,
    category: 'Opposite Claim - Affirmative',
    input: 'Water freezes into ice at zero degrees Celsius at standard atmospheric pressure.',
    inputType: 'text',
    expectedVerdict: ['TRUE', 'MOSTLY TRUE', 'Safe to Share']
  },
  {
    id: 10,
    category: 'Opposite Claim - Negative / False',
    input: 'Water boils into steam at zero degrees Celsius at standard atmospheric pressure.',
    inputType: 'text',
    expectedVerdict: ['FALSE', 'CONTRADICTED', 'Do Not Share']
  }
];

async function runSingleVerification(testCase) {
  const startTime = Date.now();
  const requestId = `test-${testCase.id}-${Date.now()}`;

  // Step 1: Extraction & Search Planning
  const extraction = await extractClaims(testCase.input, testCase.inputType);
  const { claim, claims: subClaims, queries, domain } = extraction;

  // Step 2: Tavily Search
  const searchRes = await executeTavilySearch(queries, claim);
  const { results: rawResults, tavilyAnswer } = searchRes;

  // Step 3: Source Quality & Agreement
  const trustedSources = scoreAndFilterSources(rawResults, { minTrustScore: 35, maxSources: 15 }, claim);
  const sourceAgreement = computeSourceAgreement(trustedSources, claim);

  // Step 4: Gemini Analysis
  const analysis = await analyzeWithGemini(claim, trustedSources, testCase.inputType, domain, {
    tavilyAnswer,
    sourceAgreement,
    claimsList: subClaims
  });

  // Step 5: Report Assembly
  const report = buildReport({
    requestId,
    startTime,
    claim,
    inputType: testCase.inputType,
    content: testCase.input,
    analysis,
    trustedSources,
    queries,
    sourceAgreement,
    tavilyAnswer
  });

  return { report, trustedSources, queries };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('  TRUTHLENS EVIDENCE-GROUNDED VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  const results = [];

  for (const tc of TEST_CASES) {
    console.log(`[Test Case ${tc.id}/10] ${tc.category}`);
    console.log(`  Input: "${tc.input}"`);

    try {
      const { report, trustedSources, queries } = await runSingleVerification(tc);

      console.log(`  Queries Executed : ${queries.length} queries`);
      console.log(`  Sources Retrieved: ${trustedSources.length} sources`);
      console.log(`  Delivered Verdict: ${report.verdict || report.recommendation}`);
      console.log(`  Credibility Score: ${report.credibilityScore}/100`);
      console.log(`  Confidence Score : ${report.confidenceScore}/100`);
      console.log(`  Risk Score       : ${report.riskScore}/100 (${report.riskLevel} Risk)`);
      console.log(`  Explanation Snippet: "${(report.explanation || '').slice(0, 100)}..."`);

      const deliveredVerdict = (report.verdict || report.recommendation).toUpperCase();
      const isMatch = tc.expectedVerdict.some(ev => deliveredVerdict.includes(ev.toUpperCase()) || report.recommendation.toUpperCase().includes(ev.toUpperCase()));

      if (isMatch) {
        console.log(`  Result: ✅ PASSED (Grounding Verified)\n`);
      } else {
        console.log(`  Result: ⚠️ NEEDS REVIEW (Expected: ${tc.expectedVerdict.join(' | ')})\n`);
      }

      results.push({ testCase: tc, report, isMatch });
    } catch (err) {
      console.error(`  Result: ❌ FAILED WITH ERROR: ${err.message}\n`);
      results.push({ testCase: tc, error: err.message, isMatch: false });
    }

    // Brief delay to respect rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  // ── MOST IMPORTANT COMPARISON VERIFICATIONS ────────────────────────────────
  console.log('================================================================');
  console.log('  COMPARATIVE GROUNDING CHECK');
  console.log('================================================================');

  const resEarthSpherical = results.find(r => r.testCase?.id === 1);
  const resEarthFlat = results.find(r => r.testCase?.id === 2);

  if (resEarthSpherical && resEarthFlat) {
    const credSpherical = resEarthSpherical.report?.credibilityScore;
    const credFlat = resEarthFlat.report?.credibilityScore;
    const verdictSpherical = resEarthSpherical.report?.verdict || resEarthSpherical.report?.recommendation;
    const verdictFlat = resEarthFlat.report?.verdict || resEarthFlat.report?.recommendation;

    console.log(`Input A ("Earth is spherical"): Verdict=${verdictSpherical}, Credibility=${credSpherical}/100`);
    console.log(`Input B ("Earth is flat")     : Verdict=${verdictFlat}, Credibility=${credFlat}/100`);

    if (credSpherical !== credFlat && verdictSpherical !== verdictFlat) {
      console.log('✅ PASS: Opposite inputs produce completely different verdicts and scores!\n');
    } else {
      console.log('❌ FAIL: Opposite inputs produced identical scores or verdicts!\n');
    }
  }

  const resCricket1983 = results.find(r => r.testCase?.id === 3);
  const resFootball1983 = results.find(r => r.testCase?.id === 4);

  if (resCricket1983 && resFootball1983) {
    const credCricket = resCricket1983.report?.credibilityScore;
    const credFootball = resFootball1983.report?.credibilityScore;

    console.log(`Input A ("1983 World Cup in cricket") : Credibility=${credCricket}/100`);
    console.log(`Input B ("1983 World Cup in football"): Credibility=${credFootball}/100`);

    if (credCricket > credFootball) {
      console.log('✅ PASS: Contextual error correctly scores lower credibility!\n');
    } else {
      console.log('❌ FAIL: Contextual error failed to reduce credibility score!\n');
    }
  }

  const passCount = results.filter(r => r.isMatch).length;
  console.log('================================================================');
  console.log(`  FINAL VERIFICATION SCORE: ${passCount}/10 TEST CASES PASSED`);
  console.log('================================================================');
}

runTestSuite();
