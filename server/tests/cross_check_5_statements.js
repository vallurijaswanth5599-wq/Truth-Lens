import 'dotenv/config';
import { extractClaims } from '../services/claimExtractor.js';
import { searchClaim } from '../services/tavilySearch.js';
import { scoreAndFilterSources, computeSourceAgreement } from '../services/sourceTrust.js';
import { analyzeWithGemini, extractImageVisualContext } from '../services/geminiAnalysis.js';
import { buildReport } from '../services/reportBuilder.js';
import { auditUrlReputation } from '../services/urlReputation.js';
import { analyzeMediaForensics } from '../services/mediaForensics.js';

const testCases = [
  {
    id: 1,
    modality: 'Text',
    inputType: 'text',
    content: 'Drinking lemon juice cures stage 4 cancer in 24 hours.',
    expectedRecommendation: 'Do Not Share',
    maxAcceptableCredibility: 35
  },
  {
    id: 2,
    modality: 'Audio',
    inputType: 'audio',
    content: 'Audio recording statement: The Federal Reserve lowered benchmark interest rates by 50 basis points in September 2024.',
    expectedRecommendation: 'Safe to Share',
    minAcceptableCredibility: 55
  },
  {
    id: 3,
    modality: 'Video',
    inputType: 'video',
    content: 'Breaking video broadcast: A nuclear explosion occurred in downtown Manhattan today.',
    expectedRecommendation: 'Do Not Share',
    maxAcceptableCredibility: 40
  },
  {
    id: 4,
    modality: 'Image',
    inputType: 'image',
    content: 'Uploaded Midjourney synthetic photo midjourney_v6_portrait.png depicting fictitious celebrity arrest',
    fileMetadata: { name: 'midjourney_v6_portrait.png', type: 'image/png' },
    expectedRecommendation: 'Do Not Share',
    maxAcceptableCredibility: 35
  },
  {
    id: 5,
    modality: 'URL / Document',
    inputType: 'url',
    content: 'http://free-crypto-giveaway-claim-now.xyz/login',
    expectedRecommendation: 'Do Not Share',
    maxAcceptableCredibility: 35
  }
];

async function runCrossCheck() {
  console.log('\n================================================================');
  console.log('  TRUTHLENS 5-STATEMENT MULTI-MODALITY CROSS-CHECK TEST SUITE  ');
  console.log('================================================================\n');

  let passedCount = 0;

  for (const tc of testCases) {
    const startTime = Date.now();
    console.log(`[Test Case ${tc.id}/5] Testing Modality: ${tc.modality.toUpperCase()}`);
    console.log(`  Input Content: "${tc.content}"`);

    try {
      let visualContext = null;
      if (tc.fileData) {
        visualContext = await extractImageVisualContext(tc.fileData, tc.fileMetadata);
      }

      const { claim, queries, domain: initialDomain, isHighImpact } = extractClaims(
        tc.content,
        tc.inputType,
        tc.fileMetadata,
        visualContext
      );

      console.log(`  Extracted Claim: "${claim.slice(0, 70)}..."`);
      console.log(`  Queries Generated: ${queries.length} queries`);

      const searchResult = await searchClaim(queries);
      const rawResults = searchResult.results || searchResult;
      const tavilyAnswer = searchResult.tavilyAnswer || null;

      console.log(`  Tavily Search: ${rawResults.length} raw results retrieved ${tavilyAnswer ? '(Tavily AI Answer present)' : ''}`);

      const trustedSources = scoreAndFilterSources(rawResults, { minTrustScore: 35, maxSources: 15 }, claim);
      const sourceAgreement = computeSourceAgreement(trustedSources, claim);

      console.log(`  Trusted Sources Passed: ${trustedSources.length}/${rawResults.length}`);

      const analysis = await analyzeWithGemini(
        claim,
        trustedSources,
        tc.inputType,
        initialDomain,
        { tavilyAnswer, sourceAgreement, fileMetadata: tc.fileMetadata }
      );

      const report = buildReport({
        requestId: `test-${tc.id}`,
        startTime,
        claim,
        inputType: tc.inputType,
        content: tc.content,
        analysis,
        trustedSources,
        queries,
        sourceAgreement,
        tavilyAnswer
      });

      if (tc.inputType === 'url') {
        report.urlMetrics = auditUrlReputation(tc.content);
      }
      if (['image', 'video', 'audio', 'document'].includes(tc.inputType)) {
        report.forensics = analyzeMediaForensics(tc.inputType, tc.fileMetadata, tc.content, claim, analysis);
      }

      console.log(`  Verdict Delivered: ${report.recommendation}`);
      console.log(`  Credibility Score: ${report.credibilityScore}/100 | Risk Score: ${report.riskScore}/100`);
      console.log(`  Explanation: ${report.explanation.slice(0, 120)}...`);

      // Validation logic
      let isPass = false;
      if (tc.expectedRecommendation === 'Do Not Share') {
        isPass = (report.recommendation === 'Do Not Share' || report.recommendation === 'Share with Caution') &&
                 report.credibilityScore <= (tc.maxAcceptableCredibility || 45);
      } else if (tc.expectedRecommendation === 'Safe to Share') {
        isPass = (report.recommendation === 'Safe to Share' || report.recommendation === 'Share with Caution') &&
                 report.credibilityScore >= (tc.minAcceptableCredibility || 60);
      }

      if (isPass) {
        console.log(`  STATUS: ✅ PASSED (Report is highly accurate!)\n`);
        passedCount++;
      } else {
        console.log(`  STATUS: ⚠️ NEEDS CALIBRATION (Expected: ${tc.expectedRecommendation})\n`);
      }

    } catch (err) {
      console.error(`  STATUS: ❌ FAILED WITH ERROR: ${err.message}\n`);
    }

    // Delay between cases to respect API rate limits
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('================================================================');
  console.log(`  CROSS-CHECK RESULTS: ${passedCount}/5 TEST CASES ACCURATE`);
  console.log('================================================================\n');

  if (passedCount < 5) {
    process.exit(1);
  }
}

runCrossCheck();
