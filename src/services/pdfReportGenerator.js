/**
 * TruthLens PDF Report Generator
 * Creates a professionally formatted PDF verification report using jsPDF.
 * All content is generated client-side — no server dependency.
 */

import { jsPDF } from 'jspdf';

// ── Color Palette ────────────────────────────────────────────────────────────
const COLORS = {
  bg:         [10, 12, 28],
  headerBg:   [15, 18, 42],
  cardBg:     [18, 22, 48],
  white:      [240, 244, 255],
  muted:      [139, 156, 200],
  dimmed:     [79, 91, 138],
  emerald:    [52, 211, 153],
  amber:      [251, 191, 36],
  rose:       [251, 113, 133],
  indigo:     [129, 140, 248],
  cyan:       [34, 211, 238],
  purple:     [192, 132, 252],
  verdictColors: {
    'Safe to Share':         [16, 185, 129],
    'Share with Caution':    [245, 158, 11],
    'Do Not Share':          [244, 63, 94],
    'Requires Expert Review':[168, 85, 247],
    'Insufficient Evidence': [100, 116, 139],
  },
};

/**
 * Generate and download a PDF verification report.
 * @param {object} report - The full verification report object
 */
export function generatePDFReport(report) {
  const {
    requestId, timestamp, executionTimeMs, recommendation,
    credibilityScore, confidenceScore, riskLevel,
    domain, claims, sources, explanation, isHighImpact,
    input, inputType,
    expertReviewPacket,
    conflictsDetected, conflictSummary,
    evidenceSummary, recommendationRationale,
    evidenceFor, evidenceAgainst,
    sourceQualityAssessment,
    evidenceQuality, sourceAgreement,
    forensics, urlMetrics,
  } = report;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  const verdictColor = COLORS.verdictColors[recommendation] || COLORS.indigo;

  // ── Helper: Check for page overflow & add new page ─────────────────────
  function checkPage(needed = 20) {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = 15;
      drawPageBg();
    }
  }

  // ── Helper: Draw page background ───────────────────────────────────────
  function drawPageBg() {
    doc.setFillColor(...COLORS.bg);
    doc.rect(0, 0, pageW, pageH, 'F');
  }

  // ── Helper: Draw section header ────────────────────────────────────────
  function drawSectionHeader(title, iconText = '●') {
    checkPage(18);
    y += 6;
    doc.setFillColor(...COLORS.cardBg);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.indigo);
    doc.text(iconText, margin + 4, y + 6.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(title, margin + 10, y + 6.5);

    y += 14;
  }

  // ── Helper: Draw key-value pair ────────────────────────────────────────
  function drawKeyValue(key, value, valueColor = COLORS.white) {
    checkPage(8);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dimmed);
    doc.text(key.toUpperCase(), margin + 4, y);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...valueColor);
    const lines = doc.splitTextToSize(String(value || 'N/A'), contentW - 50);
    doc.text(lines, margin + 50, y);
    y += Math.max(6, lines.length * 4.5);
  }

  // ── Helper: Draw wrapped text block ────────────────────────────────────
  function drawTextBlock(text, color = COLORS.muted, fontSize = 8.5, indent = 4) {
    if (!text) return;
    checkPage(12);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), contentW - indent * 2);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin + indent, y);
      y += 4.2;
    }
    y += 2;
  }

  // ── Helper: Draw horizontal divider ────────────────────────────────────
  function drawDivider() {
    checkPage(6);
    y += 2;
    doc.setDrawColor(30, 35, 65);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, y, pageW - margin - 4, y);
    y += 4;
  }

  // ── Helper: Draw score box ─────────────────────────────────────────────
  function drawScoreBox(x, w, label, score, color) {
    doc.setFillColor(color[0], color[1], color[2], 0.15);
    doc.setFillColor(...COLORS.cardBg);
    doc.roundedRect(x, y, w, 22, 2, 2, 'F');

    // Border
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, 22, 2, 2, 'S');

    // Score
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(String(score), x + w / 2, y + 10, { align: 'center' });

    // Label
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dimmed);
    doc.text(label.toUpperCase(), x + w / 2, y + 18, { align: 'center' });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  PAGE 1: HEADER + VERDICT + SCORES
  // ═══════════════════════════════════════════════════════════════════════
  drawPageBg();

  // ── Header Banner ──────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(0, 0, pageW, 38, 'F');

  // Top accent line
  doc.setFillColor(...verdictColor);
  doc.rect(0, 0, pageW, 2, 'F');

  // Logo / Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text('TruthLens', margin, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text('Verification Report', margin, 20);

  // Right-side metadata
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.dimmed);
  doc.text(`Report ID: ${requestId}`, pageW - margin, 12, { align: 'right' });
  doc.text(`Generated: ${new Date(timestamp || Date.now()).toLocaleString()}`, pageW - margin, 17, { align: 'right' });
  doc.text(`Pipeline: ${executionTimeMs}ms`, pageW - margin, 22, { align: 'right' });

  // Domain + Type badges
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.cyan);
  doc.text(`${domain || 'General'} · ${inputType || 'text'}${isHighImpact ? ' · ⚠ HIGH-IMPACT' : ''}`, margin, 30);

  y = 42;

  // ── Verdict Banner ─────────────────────────────────────────────────────
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(recommendation.toUpperCase(), pageW / 2, y + 8, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Risk Level: ${riskLevel}`, pageW / 2, y + 14.5, { align: 'center' });

  y += 24;

  // ── Score Triptych ─────────────────────────────────────────────────────
  const boxW = (contentW - 8) / 3;
  const credColor = credibilityScore >= 70 ? COLORS.emerald : credibilityScore >= 40 ? COLORS.amber : COLORS.rose;
  drawScoreBox(margin, boxW, 'Credibility', credibilityScore, credColor);
  drawScoreBox(margin + boxW + 4, boxW, 'Confidence', confidenceScore, COLORS.indigo);

  const riskScore = riskLevel === 'High' ? 88 : riskLevel === 'Medium' ? 52 : 14;
  const riskColor = riskLevel === 'High' ? COLORS.rose : riskLevel === 'Medium' ? COLORS.amber : COLORS.emerald;
  drawScoreBox(margin + (boxW + 4) * 2, boxW, 'Risk Factor', riskScore, riskColor);

  y += 28;

  // ── Input / Claim ──────────────────────────────────────────────────────
  drawSectionHeader('Submitted Content', '📝');
  drawTextBlock(input, COLORS.white, 9);

  // ═══════════════════════════════════════════════════════════════════════
  //  AI REASONING & EXPLANATION
  // ═══════════════════════════════════════════════════════════════════════
  drawSectionHeader('AI Reasoning & Explanation', '🧠');
  drawTextBlock(explanation, COLORS.white, 8.5);

  // Evidence Summary
  if (evidenceSummary) {
    drawDivider();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.cyan);
    checkPage(8);
    doc.text('Evidence Summary', margin + 4, y);
    y += 5;
    drawTextBlock(evidenceSummary);
  }

  // Evidence For
  if (evidenceFor) {
    drawDivider();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.emerald);
    checkPage(8);
    doc.text('✓ Evidence Supporting the Claim', margin + 4, y);
    y += 5;
    drawTextBlock(evidenceFor, COLORS.muted);
  }

  // Evidence Against
  if (evidenceAgainst) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.rose);
    checkPage(8);
    doc.text('✗ Evidence Against the Claim', margin + 4, y);
    y += 5;
    drawTextBlock(evidenceAgainst, COLORS.muted);
  }

  // Recommendation Rationale
  if (recommendationRationale) {
    drawDivider();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.purple);
    checkPage(8);
    doc.text('Recommendation Rationale', margin + 4, y);
    y += 5;
    drawTextBlock(recommendationRationale);
  }

  // Source Quality Assessment
  if (sourceQualityAssessment) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.indigo);
    checkPage(8);
    doc.text('Source Quality Assessment', margin + 4, y);
    y += 5;
    drawTextBlock(sourceQualityAssessment);
  }

  // ── Conflicts ──────────────────────────────────────────────────────────
  if (conflictsDetected) {
    drawDivider();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.rose);
    checkPage(8);
    doc.text('⚠ Conflicting Sources Detected', margin + 4, y);
    y += 5;
    drawTextBlock(conflictSummary || 'Sources contain significantly contradictory claims.', COLORS.rose);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  EVIDENCE QUALITY (if available from v2 pipeline)
  // ═══════════════════════════════════════════════════════════════════════
  if (evidenceQuality || sourceAgreement) {
    drawSectionHeader('Evidence Quality Metrics', '📊');

    if (evidenceQuality) {
      drawKeyValue('Evidence Grade', `${evidenceQuality.grade} — ${evidenceQuality.label}`,
        evidenceQuality.grade === 'A' || evidenceQuality.grade === 'B' ? COLORS.emerald :
        evidenceQuality.grade === 'C' ? COLORS.amber : COLORS.rose);
    }

    if (sourceAgreement) {
      drawKeyValue('Supporting Sources', sourceAgreement.supporting, COLORS.emerald);
      drawKeyValue('Contradicting Sources', sourceAgreement.contradicting, COLORS.rose);
      drawKeyValue('Neutral Sources', sourceAgreement.neutral, COLORS.muted);
      drawKeyValue('Agreement Ratio', `${sourceAgreement.agreementRatio}%`, COLORS.indigo);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  CLAIM VERIFICATION TABLE
  // ═══════════════════════════════════════════════════════════════════════
  if (claims && claims.length > 0) {
    drawSectionHeader(`Claim Verification (${claims.length} claim${claims.length > 1 ? 's' : ''})`, '📋');

    claims.forEach((claim, idx) => {
      checkPage(18);

      // Claim background
      const claimBgColor = claim.verified ? [16, 40, 32] : [40, 16, 22];
      doc.setFillColor(...claimBgColor);
      const claimText = doc.splitTextToSize(`"${claim.text}"`, contentW - 30);
      const claimH = Math.max(14, claimText.length * 4 + 10);
      doc.roundedRect(margin + 2, y, contentW - 4, claimH, 1.5, 1.5, 'F');

      // Status indicator
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const statusColor = claim.verified ? COLORS.emerald : COLORS.rose;
      doc.setTextColor(...statusColor);
      doc.text(claim.verified ? '✓ VERIFIED' : '✗ UNVERIFIED', margin + 6, y + 5);

      // Claim text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.white);
      doc.text(claimText, margin + 6, y + 10);

      // Source citation
      if (claim.source) {
        doc.setFontSize(6.5);
        doc.setTextColor(...COLORS.dimmed);
        doc.text(`Source: ${claim.source}`, pageW - margin - 6, y + 5, { align: 'right' });
      }

      y += claimH + 3;

      // Contradiction note
      if (claim.contradiction) {
        checkPage(8);
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.rose);
        const contrLines = doc.splitTextToSize(`↳ ${claim.contradiction}`, contentW - 20);
        doc.text(contrLines, margin + 10, y);
        y += contrLines.length * 3.5 + 2;
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  TRUSTED SOURCES
  // ═══════════════════════════════════════════════════════════════════════
  if (sources && sources.length > 0) {
    drawSectionHeader(`Trusted Sources & Citations (${sources.length})`, '🔗');

    sources.forEach((src, i) => {
      checkPage(14);

      // Source row
      doc.setFillColor(...COLORS.cardBg);
      doc.roundedRect(margin + 2, y, contentW - 4, 11, 1.5, 1.5, 'F');

      // Source number
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.indigo);
      doc.text(`[${i + 1}]`, margin + 5, y + 5);

      // Source name
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.white);
      const srcName = src.name && src.name.length > 55 ? src.name.substring(0, 55) + '…' : (src.name || src.domain);
      doc.text(srcName, margin + 14, y + 5);

      // Trust score
      const trustColor = src.reliability >= 90 ? COLORS.emerald : src.reliability >= 70 ? COLORS.amber : COLORS.rose;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...trustColor);
      doc.text(`${src.reliability}/100`, pageW - margin - 6, y + 5, { align: 'right' });

      // Type + Domain
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dimmed);
      doc.text(`${src.domain} · ${src.type}${src.publishedDate ? ` · ${src.publishedDate}` : ''}`, margin + 14, y + 9);

      y += 13;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  URL METRICS (if applicable)
  // ═══════════════════════════════════════════════════════════════════════
  if (urlMetrics) {
    drawSectionHeader('URL Security Audit', '🔒');
    drawKeyValue('URL', urlMetrics.url);
    drawKeyValue('Trust Score', `${urlMetrics.trustScore}/100`, urlMetrics.trustScore >= 70 ? COLORS.emerald : COLORS.rose);
    drawKeyValue('Phishing Score', `${urlMetrics.phishingScore}/100`, urlMetrics.phishingScore >= 50 ? COLORS.rose : COLORS.emerald);
    drawKeyValue('Risk Level', urlMetrics.riskLevel, urlMetrics.riskLevel === 'High' ? COLORS.rose : COLORS.emerald);
    drawKeyValue('SSL Certificate', urlMetrics.sslCertificate);

    if (urlMetrics.suspiciousSignals && urlMetrics.suspiciousSignals.length > 0) {
      drawDivider();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.rose);
      checkPage(8);
      doc.text('Suspicious Signals:', margin + 4, y);
      y += 5;
      urlMetrics.suspiciousSignals.forEach(signal => {
        checkPage(5);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.muted);
        doc.text(`• ${signal}`, margin + 8, y);
        y += 4;
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  MEDIA FORENSICS (if applicable)
  // ═══════════════════════════════════════════════════════════════════════
  if (forensics) {
    drawSectionHeader('Media Forensics & Deepfake Analysis', '🔬');
    drawKeyValue('File Type', forensics.type || inputType);
    if (forensics.fileName) drawKeyValue('File Name', forensics.fileName);
    if (forensics.aiProbability !== undefined) {
      drawKeyValue('AI Generation Probability', `${forensics.aiProbability}%`,
        forensics.aiProbability > 50 ? COLORS.rose : COLORS.emerald);
    }
    if (forensics.forensicConclusion) {
      drawDivider();
      drawTextBlock(forensics.forensicConclusion);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  EXPERT REVIEW PACKET
  // ═══════════════════════════════════════════════════════════════════════
  if (expertReviewPacket) {
    drawSectionHeader('Expert Review Packet', '📦');
    drawKeyValue('Submission ID', expertReviewPacket.submissionId);
    drawKeyValue('Claims Extracted', expertReviewPacket.claimsExtracted);
    drawKeyValue('Sources Cited', expertReviewPacket.authoritativeSourcesCited);
    drawKeyValue('Pipeline', expertReviewPacket.provenanceChain || 'TruthLens RAV Pipeline');

    if (expertReviewPacket.claimsGroundedInSources !== undefined) {
      drawKeyValue('Claims Grounded', expertReviewPacket.claimsGroundedInSources, COLORS.emerald);
      drawKeyValue('Claims Ungrounded', expertReviewPacket.claimsUngrounded || 0, COLORS.rose);
    }

    if (expertReviewPacket.uncertaintyDisclosed && expertReviewPacket.uncertaintyDisclosed.length > 0) {
      drawDivider();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.amber);
      checkPage(8);
      doc.text('Uncertainty Flags:', margin + 4, y);
      y += 5;
      expertReviewPacket.uncertaintyDisclosed.forEach(flag => {
        checkPage(5);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.muted);
        const flagLines = doc.splitTextToSize(`⚠ ${flag}`, contentW - 16);
        doc.text(flagLines, margin + 8, y);
        y += flagLines.length * 3.5 + 1;
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  FOOTER
  // ═══════════════════════════════════════════════════════════════════════
  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(30, 35, 65);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

    // Footer text
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.dimmed);
    doc.text(
      'TruthLens — AI-Powered Verification Report · This report is generated by an automated pipeline and should not replace professional judgment.',
      margin, pageH - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  // ── Download ───────────────────────────────────────────────────────────
  doc.save(`TruthLens-Report-${requestId}.pdf`);
}
