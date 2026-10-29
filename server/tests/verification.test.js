/**
 * TruthLens Automated Unit & Integration Tests
 * Run with: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { extractClaims } from '../services/claimExtractor.js';
import { scoreDomain, scoreAndFilterSources } from '../services/sourceTrust.js';
import { auditUrlReputation } from '../services/urlReputation.js';
import { analyzeMediaForensics } from '../services/mediaForensics.js';
import { buildReport } from '../services/reportBuilder.js';

test('Claim Extractor - parses claims and generates search queries', async () => {
  const result = await extractClaims('Is drinking lemon water a cure for cancer?', 'text');
  assert.equal(typeof result.claim, 'string');
  assert.ok(result.queries.length >= 2);
  assert.equal(result.domain, 'Health / Medical');
  assert.equal(result.isHighImpact, true);
});

test('Source Trust Scorer - correctly assigns scores and filters low-reliability sources', () => {
  assert.equal(scoreDomain('who.int'), 99);
  assert.equal(scoreDomain('reuters.com'), 93);
  assert.equal(scoreDomain('infowars.com'), 2);

  const rawResults = [
    { url: 'https://www.who.int/news/item/1', title: 'WHO Report', content: 'Official data', score: 0.9 },
    { url: 'https://www.infowars.com/fake', title: 'Fake News', content: 'Scam', score: 0.8 },
  ];

  const filtered = scoreAndFilterSources(rawResults, { minTrustScore: 45 });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].domain, 'who.int');
});

test('URL Reputation Audit - detects phishing patterns and calculates risk', () => {
  const safeAudit = auditUrlReputation('https://reuters.com');
  assert.equal(safeAudit.riskLevel, 'Low');
  assert.ok(safeAudit.trustScore >= 90);

  const riskyAudit = auditUrlReputation('http://login-verify-account.xyz');
  assert.equal(riskyAudit.riskLevel, 'High');
  assert.ok(riskyAudit.phishingScore >= 50);
});

test('Media Forensics - extracts metadata and calculates dynamic AI probability', () => {
  const imageForensics = analyzeMediaForensics('image', { name: 'photo.jpg', lastModified: Date.now() });
  assert.equal(imageForensics.type, 'image');
  assert.equal(typeof imageForensics.deepfakeProbability, 'number');
  assert.ok(imageForensics.forensicConclusion.length > 0);

  const audioForensics = analyzeMediaForensics('audio', { name: 'speech.mp3' });
  assert.equal(audioForensics.type, 'audio');
  assert.ok(audioForensics.vocalFormantSpectrum.length > 0);
});

test('Image Forensics - produces distinctly different scores across 8 image types', () => {
  const testCases = [
    { type: 'real_selfie', filename: 'IMG_20240807_1234.jpg', prompt: 'Real selfie taken on iPhone 15' },
    { type: 'ai_portrait', filename: 'midjourney_v6_portrait.png', prompt: 'Midjourney v6 hyper-realistic AI portrait' },
    { type: 'celebrity_deepfake', filename: 'dalle3_celebrity_fake.jpg', prompt: 'DALL-E 3 generated photo of famous person in fake location' },
    { type: 'landscape', filename: 'PXL_mountain_landscape.jpg', prompt: 'Landscape photo of Rocky Mountains shot on Pixel 8' },
    { type: 'logo', filename: 'company_brand_logo.svg', prompt: 'Official vector brand logo' },
    { type: 'document', filename: 'policy_leak_document.pdf', prompt: 'Scanned PDF policy document' },
    { type: 'screenshot', filename: 'twitter_screenshot_post.png', prompt: 'UI screenshot of social media post' },
    { type: 'meme', filename: 'photoshop_edited_meme.jpg', prompt: 'Photoshop edited viral meme image' },
  ];

  const mockSources = [{ domain: 'reuters.com', reliability: 93, name: 'Reuters', url: 'https://reuters.com' }];

  const results = testCases.map(tc => {
    const forensics = analyzeMediaForensics('image', { name: tc.filename }, tc.prompt, tc.prompt);
    const mockAnalysis = {
      recommendation: forensics.deepfakeProbability >= 50 ? 'Do Not Share' : 'Safe to Share',
      credibilityScore: 100 - forensics.deepfakeProbability,
      confidenceScore: forensics.confidence,
      riskLevel: forensics.deepfakeProbability >= 50 ? 'High' : 'Low',
      domain: 'General / Media',
      explanation: forensics.forensicConclusion,
      evidenceSummary: 'Multi-vector analysis completed.',
      claims: [{ text: tc.prompt, verified: forensics.deepfakeProbability < 50 }],
    };

    const report = buildReport({
      requestId: `vt-test-${tc.type}`,
      startTime: Date.now() - 100,
      claim: tc.prompt,
      inputType: 'image',
      content: tc.prompt,
      analysis: mockAnalysis,
      trustedSources: mockSources,
      queries: ['test query'],
      fileMetadata: { name: tc.filename },
      forensics,
    });

    return {
      type: tc.type,
      deepfakeProbability: forensics.deepfakeProbability,
      credibilityScore: report.credibilityScore,
      riskScore: report.riskScore,
    };
  });

  // Verify dynamic range and distinct output values
  const aiPortrait = results.find(r => r.type === 'ai_portrait');
  const realSelfie = results.find(r => r.type === 'real_selfie');

  assert.ok(aiPortrait.deepfakeProbability > 70, 'AI portrait should have high deepfake probability');
  assert.ok(realSelfie.deepfakeProbability < 20, 'Real selfie should have low deepfake probability');
  assert.notEqual(aiPortrait.credibilityScore, realSelfie.credibilityScore, 'AI portrait and real selfie must have different credibility scores');
  assert.notEqual(aiPortrait.riskScore, realSelfie.riskScore, 'AI portrait and real selfie must have different risk scores');

  // Ensure unique deepfake probabilities across different image categories
  const probSet = new Set(results.map(r => r.deepfakeProbability));
  assert.ok(probSet.size >= 4, 'Diverse image types must produce distinct probability scores');
});

test('Report Builder - constructs valid report shape matching ReportView contract', () => {
  const mockAnalysis = {
    recommendation: 'Do Not Share',
    credibilityScore: 15,
    confidenceScore: 85,
    riskLevel: 'High',
    domain: 'Health / Medical',
    isHighImpact: true,
    explanation: 'Misinformation detected.',
    evidenceSummary: 'Sources refute claim.',
    recommendationRationale: 'High harm risk.',
    conflictsDetected: false,
    conflictSummary: null,
    claims: [{ text: 'Fake claim', verified: false }],
  };

  const mockSources = [{ domain: 'reuters.com', reliability: 93, name: 'Reuters', url: 'https://reuters.com' }];

  const report = buildReport({
    requestId: 'vt-test-123',
    startTime: Date.now() - 500,
    claim: 'Fake claim',
    inputType: 'text',
    content: 'Fake claim text',
    analysis: mockAnalysis,
    trustedSources: mockSources,
    queries: ['Fake claim query'],
  });

  assert.equal(report.requestId, 'vt-test-123');
  assert.equal(report.recommendation, 'Do Not Share');
  assert.equal(typeof report.credibilityScore, 'number');
  assert.equal(report.expertReviewPacket.submissionId, 'vt-test-123');
});
